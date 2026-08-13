'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Share2,
  Sparkles,
  Layers,
  Sliders,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import type { DesignNode, GraphicTemplate } from '@/lib/types';
import { GRAPHIC_TEMPLATES, CANVAS_PRESETS } from '@/lib/canvas-templates';
import { ContextualActionBar } from './contextual-action-bar';
import { LeftDockPanels } from './left-dock-panels';
import { CanvasArtboard } from './canvas-artboard';
import { exportCanvasToDataUrl, downloadDataUrl } from '@/lib/canvas-export';

const INITIAL_NODES: DesignNode[] = GRAPHIC_TEMPLATES[0].nodes;

type DrawerTab = 'templates' | 'elements' | 'text' | 'brand' | 'uploads' | 'ai' | 'layers';

type GraphicWorkspaceProps = {
  copilotOpen: boolean;
  onToggleCopilot: () => void;
  onAskCopilotFromCanvas?: (prompt: string, selectedNode?: DesignNode) => void;
};

export function GraphicWorkspace({
  copilotOpen,
  onToggleCopilot,
  onAskCopilotFromCanvas,
}: GraphicWorkspaceProps) {
  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [zoom, setZoom] = useState(60); // default comfortable view zoom

  // UI state
  const [activeTab, setActiveTab] = useState<DrawerTab | null>('templates');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('main-title');

  // History State
  const [history, setHistory] = useState<{
    past: DesignNode[][];
    present: DesignNode[];
    future: DesignNode[][];
  }>({
    past: [],
    present: INITIAL_NODES,
    future: [],
  });

  const nodes = history.present;
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Push new state into history
  const setNodesWithHistory = useCallback((newNodes: DesignNode[] | ((curr: DesignNode[]) => DesignNode[])) => {
    setHistory((prev) => {
      const nextPresent = typeof newNodes === 'function' ? newNodes(prev.present) : newNodes;
      return {
        past: [...prev.past.slice(-30), prev.present],
        present: nextPresent,
        future: [],
      };
    });
  }, []);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Global Undo / Redo Hotkeys
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Node Mutations
  function updateNode(id: string, patch: Partial<DesignNode>) {
    setNodesWithHistory((curr) => curr.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function addNode(kind: 'text' | 'shape' | 'image', extra?: Partial<DesignNode>) {
    const id = `${kind}-${Date.now()}`;
    const newNode: DesignNode = {
      id,
      kind,
      name: extra?.name || `New ${kind}`,
      x: Math.round(canvasWidth / 2 - (extra?.width || 200) / 2),
      y: Math.round(canvasHeight / 2 - (extra?.height || 100) / 2),
      width: extra?.width || 240,
      height: extra?.height || 120,
      rotation: 0,
      opacity: 1,
      ...extra,
    };
    setNodesWithHistory((curr) => [...curr, newNode]);
    setSelectedNodeId(id);
  }

  function duplicateNode(id: string) {
    const target = nodes.find((n) => n.id === id);
    if (!target) return;
    const cloned: DesignNode = {
      ...target,
      id: `${target.kind}-${Date.now()}`,
      x: target.x + 30,
      y: target.y + 30,
    };
    setNodesWithHistory((curr) => [...curr, cloned]);
    setSelectedNodeId(cloned.id);
  }

  function deleteNode(id: string) {
    setNodesWithHistory((curr) => curr.filter((n) => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }

  function bringToFront(id: string) {
    setNodesWithHistory((curr) => {
      const idx = curr.findIndex((n) => n.id === id);
      if (idx === -1) return curr;
      const target = curr[idx];
      return [...curr.filter((n) => n.id !== id), target];
    });
  }

  function sendToBack(id: string) {
    setNodesWithHistory((curr) => {
      const idx = curr.findIndex((n) => n.id === id);
      if (idx === -1) return curr;
      const target = curr[idx];
      return [target, ...curr.filter((n) => n.id !== id)];
    });
  }

  function reorderNode(id: string, direction: 'up' | 'down') {
    setNodesWithHistory((curr) => {
      const idx = curr.findIndex((n) => n.id === id);
      if (idx === -1) return curr;
      const target = curr[idx];
      const next = [...curr];
      next.splice(idx, 1);
      const newIdx = direction === 'up' ? Math.min(curr.length - 1, idx + 1) : Math.max(0, idx - 1);
      next.splice(newIdx, 0, target);
      return next;
    });
  }

  function loadTemplate(template: GraphicTemplate) {
    setCanvasWidth(template.width);
    setCanvasHeight(template.height);
    setNodesWithHistory(template.nodes);
    setSelectedNodeId(template.nodes[0]?.id || null);
  }

  function applyTheme(colors: string[]) {
    if (colors.length < 3) return;
    const [primary, secondary, textLight, bg, accent] = colors;
    setNodesWithHistory((curr) =>
      curr.map((n) => {
        if (n.kind === 'shape') {
          return { ...n, backgroundColor: primary };
        }
        if (n.kind === 'text') {
          return { ...n, color: textLight || '#ffffff' };
        }
        return n;
      })
    );
  }

  // Export Modal State
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'svg'>('png');
  const [exportScale, setExportScale] = useState<number>(2);
  const [exporting, setExporting] = useState(false);

  async function handleDownloadExport() {
    setExporting(true);
    try {
      if (exportFormat === 'svg') {
        const svgContent = generateSvg(nodes, canvasWidth, canvasHeight);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        downloadDataUrl(url, `rezit-design-${Date.now()}.svg`);
      } else {
        const dataUrl = await exportCanvasToDataUrl(nodes, canvasWidth, canvasHeight, exportFormat, exportScale);
        downloadDataUrl(dataUrl, `rezit-design-${Date.now()}.${exportFormat}`);
      }
      setExportOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      {/* Contextual Action Bar */}
      <ContextualActionBar
        selectedNode={selectedNode}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onUpdateNode={(patch) => selectedNodeId && updateNode(selectedNodeId, patch)}
        onChangeCanvasSize={(w, h) => {
          setCanvasWidth(w);
          setCanvasHeight(h);
        }}
        onOpenAiStudio={() => setActiveTab('ai')}
      />

      {/* Main Workspace Stage */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Rail and Drawers */}
        <LeftDockPanels
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onAddNode={addNode}
          onLoadTemplate={loadTemplate}
          onApplyTheme={applyTheme}
          onReorderNode={reorderNode}
          onToggleVisibility={(id) => {
            const target = nodes.find((n) => n.id === id);
            if (target) updateNode(id, { hidden: !target.hidden });
          }}
          onToggleLock={(id) => {
            const target = nodes.find((n) => n.id === id);
            if (target) updateNode(id, { locked: !target.locked });
          }}
          onDeleteNode={deleteNode}
        />

        {/* Center Artboard Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', position: 'relative' }}>
          <CanvasArtboard
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            onSelectNode={setSelectedNodeId}
            onUpdateNode={updateNode}
            onDuplicateNode={duplicateNode}
            onDeleteNode={deleteNode}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onAskAi={(nodeId, prompt) => {
              const node = nodes.find((n) => n.id === nodeId);
              if (onAskCopilotFromCanvas) onAskCopilotFromCanvas(prompt, node);
            }}
          />

          {/* Bottom Bar Controls */}
          <div
            style={{
              height: '42px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              zIndex: 30,
            }}
          >
            {/* Dimensions Info & Undo/Redo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                Canvas: {canvasWidth} × {canvasHeight}px
              </span>

              <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0' }} />

              <button
                type="button"
                onClick={handleUndo}
                disabled={history.past.length === 0}
                style={{
                  ...bottomBtnStyle,
                  opacity: history.past.length === 0 ? 0.4 : 1,
                  cursor: history.past.length === 0 ? 'not-allowed' : 'pointer',
                }}
                title="Undo (Ctrl+Z)"
              >
                <Undo size={14} />
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={history.future.length === 0}
                style={{
                  ...bottomBtnStyle,
                  opacity: history.future.length === 0 ? 0.4 : 1,
                  cursor: history.future.length === 0 ? 'not-allowed' : 'pointer',
                }}
                title="Redo (Ctrl+Y)"
              >
                <Redo size={14} />
              </button>
            </div>

            {/* Zoom Controls & Export Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setZoom(Math.max(20, zoom - 10))}
                style={bottomBtnStyle}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>

              <input
                type="range"
                min="20"
                max="150"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '80px', accentColor: '#7c3aed' }}
              />

              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', minWidth: '32px' }}>
                {zoom}%
              </span>

              <button
                type="button"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                style={bottomBtnStyle}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>

              <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0' }} />

              <button
                type="button"
                onClick={() => setExportOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Download size={13} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {exportOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              width: '420px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '16px', color: '#0f172a' }}>Export Design</strong>
              <button
                type="button"
                onClick={() => setExportOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                File Format
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                {(['png', 'jpeg', 'svg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: exportFormat === fmt ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                      backgroundColor: exportFormat === fmt ? '#f5f3ff' : '#f8fafc',
                      color: exportFormat === fmt ? '#7c3aed' : '#0f172a',
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {exportFormat !== 'svg' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Resolution Scaling
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setExportScale(s)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: exportScale === s ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                        backgroundColor: exportScale === s ? '#f5f3ff' : '#f8fafc',
                        color: exportScale === s ? '#7c3aed' : '#0f172a',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {s}x ({canvasWidth * s}×{canvasHeight * s}px)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={exporting}
              onClick={handleDownloadExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: exporting ? 'not-allowed' : 'pointer',
                marginTop: '8px',
              }}
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>{exporting ? 'Rendering...' : 'Download File'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generateSvg(nodes: DesignNode[], width: number, height: number): string {
  const elements = nodes
    .filter((n) => !n.hidden)
    .map((node) => {
      if (node.kind === 'shape') {
        const fill = node.backgroundColor || node.color || '#7c3aed';
        const r = node.borderRadius || 0;
        return `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${r}" fill="${fill}" />`;
      }
      if (node.kind === 'text') {
        const fill = node.color || '#0f172a';
        const fontSize = node.fontSize || 24;
        return `<text x="${node.x}" y="${node.y + fontSize}" font-size="${fontSize}" font-weight="${node.fontWeight || '700'}" fill="${fill}">${node.text || ''}</text>`;
      }
      return '';
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n  <rect width="100%" height="100%" fill="#ffffff"/>\n  ${elements}\n</svg>`;
}

const bottomBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px',
  height: '26px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#475569',
  cursor: 'pointer',
};
