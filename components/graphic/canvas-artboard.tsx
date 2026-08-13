'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { DesignNode, SnapGuide } from '@/lib/types';
import { GizmoOverlay } from './gizmo-overlay';
import { FloatingSelectionBar } from './floating-selection-bar';

type CanvasArtboardProps = {
  nodes: DesignNode[];
  selectedNodeId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  onSelectNode: (id: string | null) => void;
  onUpdateNode: (id: string, patch: Partial<DesignNode>) => void;
  onDuplicateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onAskAi: (nodeId: string, prompt: string) => void;
};

export function CanvasArtboard({
  nodes,
  selectedNodeId,
  canvasWidth,
  canvasHeight,
  zoom,
  onSelectNode,
  onUpdateNode,
  onDuplicateNode,
  onDeleteNode,
  onBringToFront,
  onSendToBack,
  onAskAi,
}: CanvasArtboardProps) {
  const artboardRef = useRef<HTMLDivElement>(null);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Dragging & Transforming state
  const [activeTransform, setActiveTransform] = useState<{
    handle: string; // 'drag' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rot'
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
    nodeStartW: number;
    nodeStartH: number;
    nodeStartRot: number;
  } | null>(null);

  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Handle pointer down on a node to drag it
  function handleNodePointerDown(nodeId: string, e: React.PointerEvent) {
    e.stopPropagation();
    onSelectNode(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.locked) return;

    setActiveTransform({
      handle: 'drag',
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
      nodeStartW: node.width,
      nodeStartH: node.height,
      nodeStartRot: node.rotation || 0,
    });
  }

  // Handle pointer down on a gizmo handle (resize/rotate)
  function handleGizmoPointerDown(handle: string, e: React.PointerEvent) {
    if (!selectedNode || selectedNode.locked) return;
    setActiveTransform({
      handle,
      nodeId: selectedNode.id,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: selectedNode.x,
      nodeStartY: selectedNode.y,
      nodeStartW: selectedNode.width,
      nodeStartH: selectedNode.height,
      nodeStartRot: selectedNode.rotation || 0,
    });
  }

  // Global pointer move and up handlers during transform
  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      if (!activeTransform) return;

      const scale = zoom / 100;
      const dx = (e.clientX - activeTransform.startX) / scale;
      const dy = (e.clientY - activeTransform.startY) / scale;
      const { handle, nodeId, nodeStartX, nodeStartY, nodeStartW, nodeStartH, nodeStartRot } = activeTransform;

      if (handle === 'drag') {
        let nextX = Math.round(nodeStartX + dx);
        let nextY = Math.round(nodeStartY + dy);
        const newGuides: SnapGuide[] = [];

        // Snap to center horizontal & vertical
        const nodeCenterX = nextX + nodeStartW / 2;
        const nodeCenterY = nextY + nodeStartH / 2;
        const canvasCenterX = canvasWidth / 2;
        const canvasCenterY = canvasHeight / 2;

        if (Math.abs(nodeCenterX - canvasCenterX) < 8) {
          nextX = canvasCenterX - nodeStartW / 2;
          newGuides.push({ type: 'x', position: canvasCenterX });
        }
        if (Math.abs(nodeCenterY - canvasCenterY) < 8) {
          nextY = canvasCenterY - nodeStartH / 2;
          newGuides.push({ type: 'y', position: canvasCenterY });
        }

        setSnapGuides(newGuides);
        onUpdateNode(nodeId, { x: nextX, y: nextY });
      } else if (handle === 'rot') {
        if (!artboardRef.current) return;
        const rect = artboardRef.current.getBoundingClientRect();
        const centerScreenX = rect.left + (nodeStartX + nodeStartW / 2) * scale;
        const centerScreenY = rect.top + (nodeStartY + nodeStartH / 2) * scale;
        const angleRad = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);
        let angleDeg = Math.round((angleRad * 180) / Math.PI) + 90;
        if (angleDeg < 0) angleDeg += 360;

        // Snap rotation at 0, 45, 90, 180, 270
        if (Math.abs(angleDeg - 0) < 5 || Math.abs(angleDeg - 360) < 5) angleDeg = 0;
        else if (Math.abs(angleDeg - 90) < 5) angleDeg = 90;
        else if (Math.abs(angleDeg - 180) < 5) angleDeg = 180;
        else if (Math.abs(angleDeg - 270) < 5) angleDeg = 270;

        onUpdateNode(nodeId, { rotation: angleDeg });
      } else {
        // Resize handles (nw, ne, se, sw, n, s, e, w)
        let newX = nodeStartX;
        let newY = nodeStartY;
        let newW = nodeStartW;
        let newH = nodeStartH;

        if (handle.includes('e')) newW = Math.max(20, nodeStartW + dx);
        if (handle.includes('s')) newH = Math.max(20, nodeStartH + dy);
        if (handle.includes('w')) {
          const clampedDx = Math.min(dx, nodeStartW - 20);
          newX = nodeStartX + clampedDx;
          newW = nodeStartW - clampedDx;
        }
        if (handle.includes('n')) {
          const clampedDy = Math.min(dy, nodeStartH - 20);
          newY = nodeStartY + clampedDy;
          newH = nodeStartH - clampedDy;
        }

        onUpdateNode(nodeId, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }
    }

    function handlePointerUp() {
      if (activeTransform) {
        setActiveTransform(null);
        setSnapGuides([]);
      }
    }

    if (activeTransform) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeTransform, zoom, canvasWidth, canvasHeight, onUpdateNode]);

  // Keyboard shortcuts (Delete, Escape)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (editingTextId) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        onDeleteNode(selectedNodeId);
      } else if (e.key === 'Escape') {
        onSelectNode(null);
      } else if (e.ctrlKey && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        onDuplicateNode(selectedNodeId);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, editingTextId, onDeleteNode, onSelectNode, onDuplicateNode]);

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        backgroundColor: '#f1f5f9',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        userSelect: 'none',
      }}
      onPointerDown={() => {
        onSelectNode(null);
        setEditingTextId(null);
      }}
    >
      {/* Scaled Canvas Container */}
      <div
        ref={artboardRef}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          backgroundColor: '#ffffff',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: activeTransform ? 'none' : 'transform 0.15s ease',
          overflow: 'visible',
        }}
      >
        {/* Render Layers */}
        {nodes.map((node) => {
          if (node.hidden) return null;
          const isSelected = node.id === selectedNodeId;

          return (
            <div
              key={node.id}
              onPointerDown={(e) => handleNodePointerDown(node.id, e)}
              onDoubleClick={(e) => {
                if (node.kind === 'text') {
                  e.stopPropagation();
                  setEditingTextId(node.id);
                }
              }}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
                transform: `rotate(${node.rotation || 0}deg) scale(${node.flipX ? -1 : 1}, ${node.flipY ? -1 : 1})`,
                transformOrigin: 'center center',
                opacity: typeof node.opacity === 'number' ? node.opacity : 1,
                cursor: node.locked ? 'not-allowed' : 'move',
                zIndex: node.zIndex || 1,
              }}
            >
              {/* Text Node */}
              {node.kind === 'text' && (
                <div
                  contentEditable={editingTextId === node.id}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    onUpdateNode(node.id, { text: e.currentTarget.innerText });
                    setEditingTextId(null);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: `${node.fontSize || 24}px`,
                    fontWeight: node.fontWeight || '700',
                    fontStyle: node.fontStyle || 'normal',
                    textDecoration: node.textDecoration || 'none',
                    textTransform: node.textTransform || 'none',
                    fontFamily: node.fontFamily || 'Plus Jakarta Sans, sans-serif',
                    color: node.color || '#0f172a',
                    textAlign: node.textAlign || 'left',
                    lineHeight: node.lineHeight || 1.2,
                    letterSpacing: node.letterSpacing ? `${node.letterSpacing}px` : undefined,
                    outline: editingTextId === node.id ? '2px dashed #7c3aed' : 'none',
                    padding: '2px',
                    wordBreak: 'break-word',
                  }}
                >
                  {node.text || 'Heading'}
                </div>
              )}

              {/* Shape Node */}
              {node.kind === 'shape' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: node.backgroundColor || node.color || '#7c3aed',
                    borderRadius: node.borderRadius ? `${node.borderRadius}px` : undefined,
                    border: node.borderColor && node.borderWidth ? `${node.borderWidth}px solid ${node.borderColor}` : undefined,
                    boxShadow: node.boxShadow || undefined,
                  }}
                />
              )}

              {/* Image Node */}
              {node.kind === 'image' && node.src && (
                <img
                  src={node.src}
                  alt={node.name || 'Image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: node.objectFit || 'cover',
                    borderRadius: node.borderRadius ? `${node.borderRadius}px` : undefined,
                    boxShadow: node.boxShadow || undefined,
                    filter: getImageFilterCss(node.filter),
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* 8-point Gizmo Overlay on Selected Node */}
        {selectedNode && (
          <GizmoOverlay
            node={selectedNode}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            snapGuides={snapGuides}
            onTransformStart={handleGizmoPointerDown}
          />
        )}

        {/* Floating Quick Action Bar */}
        {selectedNode && (
          <FloatingSelectionBar
            node={selectedNode}
            onDuplicate={() => onDuplicateNode(selectedNode.id)}
            onDelete={() => onDeleteNode(selectedNode.id)}
            onToggleLock={() => onUpdateNode(selectedNode.id, { locked: !selectedNode.locked })}
            onBringToFront={() => onBringToFront(selectedNode.id)}
            onSendToBack={() => onSendToBack(selectedNode.id)}
            onFlipH={() => onUpdateNode(selectedNode.id, { flipX: !selectedNode.flipX })}
            onFlipV={() => onUpdateNode(selectedNode.id, { flipY: !selectedNode.flipY })}
            onAskAi={(prompt) => onAskAi(selectedNode.id, prompt)}
          />
        )}
      </div>
    </div>
  );
}

function getImageFilterCss(filter?: string): string | undefined {
  switch (filter) {
    case 'grayscale':
      return 'grayscale(100%)';
    case 'sepia':
      return 'sepia(100%)';
    case 'contrast':
      return 'contrast(160%) brightness(105%)';
    case 'vintage':
      return 'sepia(40%) contrast(120%) brightness(95%)';
    case 'cyber':
      return 'contrast(180%) hue-rotate(180deg) saturate(200%)';
    case 'warm':
      return 'sepia(30%) saturate(140%) hue-rotate(-20deg)';
    case 'blur':
      return 'blur(4px)';
    default:
      return undefined;
  }
}
