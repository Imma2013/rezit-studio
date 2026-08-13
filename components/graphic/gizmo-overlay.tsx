'use client';

import React from 'react';
import type { DesignNode, SnapGuide } from '@/lib/types';

type GizmoOverlayProps = {
  node: DesignNode;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  snapGuides: SnapGuide[];
  onTransformStart: (handle: string, e: React.PointerEvent) => void;
};

export function GizmoOverlay({
  node,
  canvasWidth,
  canvasHeight,
  zoom,
  snapGuides,
  onTransformStart,
}: GizmoOverlayProps) {
  if (node.hidden) return null;

  const { x, y, width, height, rotation = 0, locked } = node;

  return (
    <>
      {/* Snap Guides */}
      {snapGuides.map((guide, idx) =>
        guide.type === 'x' ? (
          <div
            key={`snap-x-${idx}`}
            style={{
              position: 'absolute',
              left: `${guide.position}px`,
              top: 0,
              bottom: 0,
              width: '1px',
              borderLeft: '1px dashed #7c3aed',
              zIndex: 999,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div
            key={`snap-y-${idx}`}
            style={{
              position: 'absolute',
              top: `${guide.position}px`,
              left: 0,
              right: 0,
              height: '1px',
              borderTop: '1px dashed #7c3aed',
              zIndex: 999,
              pointerEvents: 'none',
            }}
          />
        )
      )}

      {/* Bounding Box Gizmo */}
      <div
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          border: '1.5px solid #7c3aed',
          pointerEvents: 'none',
          boxSizing: 'border-box',
          zIndex: 40,
        }}
      >
        {!locked && (
          <>
            {/* Rotation Dial Stem and Handle */}
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1px',
                height: '24px',
                backgroundColor: '#7c3aed',
                pointerEvents: 'none',
              }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('rot', e);
              }}
              title="Rotate (Drag)"
              style={{
                position: 'absolute',
                top: '-32px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #7c3aed',
                cursor: 'grab',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            />

            {/* 4 Corner Handles */}
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('nw', e);
              }}
              style={{ ...cornerHandleStyle, top: '-5px', left: '-5px', cursor: 'nwse-resize' }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('ne', e);
              }}
              style={{ ...cornerHandleStyle, top: '-5px', right: '-5px', cursor: 'nesw-resize' }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('sw', e);
              }}
              style={{ ...cornerHandleStyle, bottom: '-5px', left: '-5px', cursor: 'nesw-resize' }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('se', e);
              }}
              style={{ ...cornerHandleStyle, bottom: '-5px', right: '-5px', cursor: 'nwse-resize' }}
            />

            {/* 4 Edge Handles */}
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('n', e);
              }}
              style={{ ...edgeHandleStyle, top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('s', e);
              }}
              style={{ ...edgeHandleStyle, bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('w', e);
              }}
              style={{ ...edgeHandleStyle, left: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onTransformStart('e', e);
              }}
              style={{ ...edgeHandleStyle, right: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
            />
          </>
        )}
      </div>
    </>
  );
}

const cornerHandleStyle: React.CSSProperties = {
  position: 'absolute',
  width: '10px',
  height: '10px',
  borderRadius: '2px',
  backgroundColor: '#ffffff',
  border: '2px solid #7c3aed',
  pointerEvents: 'auto',
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
};

const edgeHandleStyle: React.CSSProperties = {
  position: 'absolute',
  width: '14px',
  height: '6px',
  borderRadius: '3px',
  backgroundColor: '#ffffff',
  border: '1.5px solid #7c3aed',
  pointerEvents: 'auto',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};
