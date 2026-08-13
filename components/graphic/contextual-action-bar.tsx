'use client';

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  Maximize2,
  Type,
  Square,
  Image as ImageIcon,
} from 'lucide-react';
import type { DesignNode, ImageFilter, CanvasDimensionPreset } from '@/lib/types';
import { CANVAS_PRESETS } from '@/lib/canvas-templates';

type ContextualActionBarProps = {
  selectedNode: DesignNode | undefined;
  canvasWidth: number;
  canvasHeight: number;
  onUpdateNode: (patch: Partial<DesignNode>) => void;
  onChangeCanvasSize: (width: number, height: number) => void;
  onOpenAiStudio: () => void;
};

const FONT_OPTIONS = [
  'Plus Jakarta Sans, sans-serif',
  'Inter, sans-serif',
  'Roboto, sans-serif',
  'Playfair Display, serif',
  'Montserrat, sans-serif',
  'JetBrains Mono, monospace',
];

const COLOR_SWATCHES = [
  '#0f172a',
  '#ffffff',
  '#7c3aed',
  '#ec4899',
  '#00c4cc',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#6366f1',
];

const IMAGE_FILTERS: { id: ImageFilter; name: string }[] = [
  { id: 'none', name: 'Original' },
  { id: 'grayscale', name: 'B&W' },
  { id: 'contrast', name: 'Punch' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'cyber', name: 'Cyber Neon' },
  { id: 'warm', name: 'Warm Sunset' },
  { id: 'sepia', name: 'Sepia' },
];

export function ContextualActionBar({
  selectedNode,
  canvasWidth,
  canvasHeight,
  onUpdateNode,
  onChangeCanvasSize,
  onOpenAiStudio,
}: ContextualActionBarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorField, setColorField] = useState<'color' | 'backgroundColor' | 'borderColor'>('color');

  // Text formatting
  if (selectedNode?.kind === 'text') {
    const fontSize = selectedNode.fontSize || 24;
    const isBold = selectedNode.fontWeight === '700' || selectedNode.fontWeight === '800' || selectedNode.fontWeight === '900';
    const isItalic = selectedNode.fontStyle === 'italic';
    const isUnderline = selectedNode.textDecoration === 'underline';
    const isUppercase = selectedNode.textTransform === 'uppercase';

    return (
      <div style={toolbarContainerStyle}>
        {/* Font Family */}
        <select
          value={selectedNode.fontFamily || FONT_OPTIONS[0]}
          onChange={(e) => onUpdateNode({ fontFamily: e.target.value })}
          style={selectStyle}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f.split(',')[0]}
            </option>
          ))}
        </select>

        <div style={dividerStyle} />

        {/* Font Size Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            type="button"
            onClick={() => onUpdateNode({ fontSize: Math.max(10, fontSize - 2) })}
            style={iconBtnStyle}
          >
            <Minus size={12} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() => onUpdateNode({ fontSize: fontSize + 2 })}
            style={iconBtnStyle}
          >
            <Plus size={12} />
          </button>
        </div>

        <div style={dividerStyle} />

        {/* Style Toggles */}
        <button
          type="button"
          onClick={() => onUpdateNode({ fontWeight: isBold ? '400' : '800' })}
          style={{ ...iconBtnStyle, backgroundColor: isBold ? '#f3e8ff' : 'transparent', color: isBold ? '#7c3aed' : '#475569' }}
          title="Bold"
        >
          <Bold size={13} />
        </button>

        <button
          type="button"
          onClick={() => onUpdateNode({ fontStyle: isItalic ? 'normal' : 'italic' })}
          style={{ ...iconBtnStyle, backgroundColor: isItalic ? '#f3e8ff' : 'transparent', color: isItalic ? '#7c3aed' : '#475569' }}
          title="Italic"
        >
          <Italic size={13} />
        </button>

        <button
          type="button"
          onClick={() => onUpdateNode({ textDecoration: isUnderline ? 'none' : 'underline' })}
          style={{ ...iconBtnStyle, backgroundColor: isUnderline ? '#f3e8ff' : 'transparent', color: isUnderline ? '#7c3aed' : '#475569' }}
          title="Underline"
        >
          <Underline size={13} />
        </button>

        <button
          type="button"
          onClick={() => onUpdateNode({ textTransform: isUppercase ? 'none' : 'uppercase' })}
          style={{
            ...iconBtnStyle,
            backgroundColor: isUppercase ? '#f3e8ff' : 'transparent',
            color: isUppercase ? '#7c3aed' : '#475569',
            fontSize: '11px',
            fontWeight: 800,
          }}
          title="Toggle Uppercase"
        >
          aA
        </button>

        <div style={dividerStyle} />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => onUpdateNode({ textAlign: 'left' })}
          style={{ ...iconBtnStyle, color: selectedNode.textAlign === 'left' ? '#7c3aed' : '#475569' }}
        >
          <AlignLeft size={13} />
        </button>
        <button
          type="button"
          onClick={() => onUpdateNode({ textAlign: 'center' })}
          style={{ ...iconBtnStyle, color: selectedNode.textAlign === 'center' ? '#7c3aed' : '#475569' }}
        >
          <AlignCenter size={13} />
        </button>
        <button
          type="button"
          onClick={() => onUpdateNode({ textAlign: 'right' })}
          style={{ ...iconBtnStyle, color: selectedNode.textAlign === 'right' ? '#7c3aed' : '#475569' }}
        >
          <AlignRight size={13} />
        </button>

        <div style={dividerStyle} />

        {/* Text Color Swatches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {COLOR_SWATCHES.slice(0, 6).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onUpdateNode({ color: c })}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: c,
                border: selectedNode.color === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Shape formatting
  if (selectedNode?.kind === 'shape') {
    return (
      <div style={toolbarContainerStyle}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
          Fill Color:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onUpdateNode({ backgroundColor: c })}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: c,
                border: selectedNode.backgroundColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Border Radius */}
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Radius:</span>
        <select
          value={selectedNode.borderRadius || 0}
          onChange={(e) => onUpdateNode({ borderRadius: Number(e.target.value) })}
          style={selectStyle}
        >
          <option value="0">Sharp (0px)</option>
          <option value="8">Small (8px)</option>
          <option value="16">Medium (16px)</option>
          <option value="32">Large (32px)</option>
          <option value="9999">Pill / Circle</option>
        </select>

        <div style={dividerStyle} />

        {/* Opacity */}
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Opacity:</span>
        <input
          type="range"
          min="10"
          max="100"
          value={(selectedNode.opacity || 1) * 100}
          onChange={(e) => onUpdateNode({ opacity: Number(e.target.value) / 100 })}
          style={{ width: '70px', accentColor: '#7c3aed' }}
        />
      </div>
    );
  }

  // Image formatting
  if (selectedNode?.kind === 'image') {
    return (
      <div style={toolbarContainerStyle}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
          Filter:
        </span>
        <select
          value={selectedNode.filter || 'none'}
          onChange={(e) => onUpdateNode({ filter: e.target.value as ImageFilter })}
          style={selectStyle}
        >
          {IMAGE_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <div style={dividerStyle} />

        {/* Rounded Corners */}
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Corners:</span>
        <select
          value={selectedNode.borderRadius || 0}
          onChange={(e) => onUpdateNode({ borderRadius: Number(e.target.value) })}
          style={selectStyle}
        >
          <option value="0">0px</option>
          <option value="12">12px</option>
          <option value="24">24px</option>
          <option value="48">48px</option>
          <option value="9999">Circle</option>
        </select>

        <div style={dividerStyle} />

        {/* Opacity */}
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Opacity:</span>
        <input
          type="range"
          min="10"
          max="100"
          value={(selectedNode.opacity || 1) * 100}
          onChange={(e) => onUpdateNode({ opacity: Number(e.target.value) / 100 })}
          style={{ width: '70px', accentColor: '#7c3aed' }}
        />
      </div>
    );
  }

  // Canvas background mode (no selection)
  return (
    <div style={toolbarContainerStyle}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
        Canvas Size:
      </span>
      <select
        value={`${canvasWidth}x${canvasHeight}`}
        onChange={(e) => {
          const [w, h] = e.target.value.split('x').map(Number);
          if (w && h) onChangeCanvasSize(w, h);
        }}
        style={selectStyle}
      >
        {CANVAS_PRESETS.map((p) => (
          <option key={p.id} value={`${p.width}x${p.height}`}>
            {p.name} ({p.width}×{p.height})
          </option>
        ))}
      </select>

      <div style={dividerStyle} />

      <button
        type="button"
        onClick={onOpenAiStudio}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          backgroundColor: '#f5f3ff',
          color: '#7c3aed',
          border: '1px solid #ddd6fe',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        <Sparkles size={12} />
        <span>Generate Image (Imagen 3)</span>
      </button>
    </div>
  );
}

const toolbarContainerStyle: React.CSSProperties = {
  height: '42px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '0 16px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  overflowX: 'auto',
};

const selectStyle: React.CSSProperties = {
  height: '28px',
  padding: '0 8px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer',
  outline: 'none',
};

const iconBtnStyle: React.CSSProperties = {
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
  transition: 'all 0.15s ease',
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '18px',
  backgroundColor: '#e2e8f0',
  margin: '0 4px',
};
