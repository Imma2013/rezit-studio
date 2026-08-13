'use client';

import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Send,
} from 'lucide-react';
import type { DesignNode } from '@/lib/types';

type FloatingSelectionBarProps = {
  node: DesignNode;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onAskAi: (prompt: string) => void;
};

export function FloatingSelectionBar({
  node,
  onDuplicate,
  onDelete,
  onToggleLock,
  onBringToFront,
  onSendToBack,
  onFlipH,
  onFlipV,
  onAskAi,
}: FloatingSelectionBarProps) {
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [promptText, setPromptText] = useState('');

  if (node.hidden) return null;

  const { x, y, width, locked, flipX, flipY } = node;

  // Position above the node (or below if too close to top edge)
  const isNearTop = y < 50;
  const topPos = isNearTop ? y + node.height + 12 : y - 48;
  const leftPos = x + width / 2;

  function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promptText.trim()) return;
    onAskAi(promptText.trim());
    setPromptText('');
    setAiPromptOpen(false);
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: `${topPos}px`,
        left: `${leftPos}px`,
        transform: 'translateX(-50%)',
        zIndex: 60,
        pointerEvents: 'auto',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          padding: '4px 6px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Ask AI Pill */}
        <button
          type="button"
          onClick={() => setAiPromptOpen(!aiPromptOpen)}
          title="Ask AI to style or edit this layer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            backgroundColor: aiPromptOpen ? '#7c3aed' : '#f5f3ff',
            color: aiPromptOpen ? '#ffffff' : '#7c3aed',
            border: 'none',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={12} />
          <span>Ask AI</span>
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />

        {/* Duplicate */}
        <button
          type="button"
          onClick={onDuplicate}
          title="Duplicate (Ctrl+D)"
          style={iconBtnStyle}
        >
          <Copy size={13} />
        </button>

        {/* Lock / Unlock */}
        <button
          type="button"
          onClick={onToggleLock}
          title={locked ? 'Unlock Layer' : 'Lock Layer'}
          style={{
            ...iconBtnStyle,
            color: locked ? '#e11d48' : '#64748b',
          }}
        >
          {locked ? <Lock size={13} /> : <Unlock size={13} />}
        </button>

        {/* Layer Ordering */}
        <button
          type="button"
          onClick={onBringToFront}
          title="Bring to Front"
          style={iconBtnStyle}
        >
          <BringToFront size={13} />
        </button>

        <button
          type="button"
          onClick={onSendToBack}
          title="Send to Back"
          style={iconBtnStyle}
        >
          <SendToBack size={13} />
        </button>

        {/* Flip Controls for Images & Shapes */}
        {(node.kind === 'image' || node.kind === 'shape') && (
          <>
            <button
              type="button"
              onClick={onFlipH}
              title="Flip Horizontal"
              style={{
                ...iconBtnStyle,
                color: flipX ? '#7c3aed' : '#64748b',
              }}
            >
              <FlipHorizontal size={13} />
            </button>
            <button
              type="button"
              onClick={onFlipV}
              title="Flip Vertical"
              style={{
                ...iconBtnStyle,
                color: flipY ? '#7c3aed' : '#64748b',
              }}
            >
              <FlipVertical size={13} />
            </button>
          </>
        )}

        <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          title="Delete (Del)"
          style={{
            ...iconBtnStyle,
            color: '#ef4444',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Inline AI Quick Prompt Bubble */}
      {aiPromptOpen && (
        <form
          onSubmit={handleAiSubmit}
          style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 8px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #7c3aed',
            boxShadow: '0 10px 28px rgba(124, 58, 237, 0.2)',
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder="e.g., make it vibrant gradient, change font..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            style={{
              flex: 1,
              minWidth: '220px',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              fontWeight: 500,
              color: '#0f172a',
            }}
          />
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Send size={11} />
          </button>
        </form>
      )}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
