'use client';

import React, { useState } from 'react';
import {
  LayoutTemplate,
  SlidersVertical,
  Type,
  Palette,
  Upload,
  Sparkles,
  Layers,
  Square,
  Circle,
  Star,
  Triangle,
  Minus,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Loader2,
  X,
} from 'lucide-react';
import type { DesignNode, ShapeType, GraphicTemplate } from '@/lib/types';
import { GRAPHIC_TEMPLATES } from '@/lib/canvas-templates';

type DrawerTab = 'templates' | 'elements' | 'text' | 'brand' | 'uploads' | 'ai' | 'layers';

type LeftDockPanelsProps = {
  activeTab: DrawerTab | null;
  onSelectTab: (tab: DrawerTab | null) => void;
  nodes: DesignNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onAddNode: (kind: 'text' | 'shape' | 'image', extra?: Partial<DesignNode>) => void;
  onLoadTemplate: (template: GraphicTemplate) => void;
  onApplyTheme: (themeColors: string[]) => void;
  onReorderNode: (id: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteNode: (id: string) => void;
};

const BRAND_THEMES = [
  { name: 'Canva Modern', colors: ['#7c3aed', '#00c4cc', '#0f172a', '#f8fafc', '#ec4899'] },
  { name: 'Cyber Neon', colors: ['#030712', '#7c3aed', '#00c4cc', '#ec4899', '#38bdf8'] },
  { name: 'Warm Sunset', colors: ['#ea580c', '#f59e0b', '#fbbf24', '#7c2d12', '#fffbeb'] },
  { name: 'Emerald Pro', colors: ['#065f46', '#059669', '#10b981', '#34d399', '#ecfdf5'] },
  { name: 'Midnight Mono', colors: ['#09090b', '#27272a', '#52525b', '#a1a1aa', '#fafafa'] },
];

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
];

export function LeftDockPanels({
  activeTab,
  onSelectTab,
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddNode,
  onLoadTemplate,
  onApplyTheme,
  onReorderNode,
  onToggleVisibility,
  onToggleLock,
  onDeleteNode,
}: LeftDockPanelsProps) {
  // AI Image generation state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('Photorealistic, 8k resolution, cinematic lighting');
  const [aiGenerating, setAiGenerating] = useState(false);

  async function handleGenerateAiImage(e: React.FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim() || aiGenerating) return;
    setAiGenerating(true);
    try {
      const response = await fetch('/api/media/image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: `${aiPrompt}, ${aiStyle}` }),
      });
      const data = (await response.json()) as { url?: string };
      if (data.url) {
        onAddNode('image', {
          src: data.url,
          name: `AI: ${aiPrompt.slice(0, 20)}`,
          width: 400,
          height: 400,
        });
        setAiPrompt('');
      }
    } catch {
      // Fallback stock image
      onAddNode('image', {
        src: STOCK_IMAGES[0],
        name: `AI: ${aiPrompt.slice(0, 20)}`,
        width: 400,
        height: 400,
      });
    } finally {
      setAiGenerating(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAddNode('image', {
          src: reader.result,
          name: file.name,
          width: 360,
          height: 360,
        });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: 'flex', height: '100%', borderRight: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
      {/* Primary Rail */}
      <div
        style={{
          width: '68px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 0',
          borderRight: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        <RailBtn
          icon={LayoutTemplate}
          label="Templates"
          active={activeTab === 'templates'}
          onClick={() => onSelectTab(activeTab === 'templates' ? null : 'templates')}
        />
        <RailBtn
          icon={SlidersVertical}
          label="Elements"
          active={activeTab === 'elements'}
          onClick={() => onSelectTab(activeTab === 'elements' ? null : 'elements')}
        />
        <RailBtn
          icon={Type}
          label="Text"
          active={activeTab === 'text'}
          onClick={() => onSelectTab(activeTab === 'text' ? null : 'text')}
        />
        <RailBtn
          icon={Palette}
          label="Brand"
          active={activeTab === 'brand'}
          onClick={() => onSelectTab(activeTab === 'brand' ? null : 'brand')}
        />
        <RailBtn
          icon={Upload}
          label="Uploads"
          active={activeTab === 'uploads'}
          onClick={() => onSelectTab(activeTab === 'uploads' ? null : 'uploads')}
        />
        <RailBtn
          icon={Sparkles}
          label="AI Studio"
          active={activeTab === 'ai'}
          onClick={() => onSelectTab(activeTab === 'ai' ? null : 'ai')}
        />
        <RailBtn
          icon={Layers}
          label="Layers"
          active={activeTab === 'layers'}
          onClick={() => onSelectTab(activeTab === 'layers' ? null : 'layers')}
        />
      </div>

      {/* Flyout Drawer */}
      {activeTab && (
        <div
          style={{
            width: '320px',
            height: '100%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <strong style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
              {activeTab === 'ai' ? 'Google Imagen 3 Studio' : activeTab}
            </strong>
            <button
              type="button"
              onClick={() => onSelectTab(null)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Content */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {GRAPHIC_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onLoadTemplate(tmpl)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{tmpl.title}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {tmpl.width} × {tmpl.height}px • {tmpl.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ELEMENTS TAB */}
            {activeTab === 'elements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Basic Shapes
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                    <ShapeBtn
                      icon={Square}
                      label="Rectangle"
                      onClick={() => onAddNode('shape', { shapeType: 'rectangle', width: 180, height: 120, backgroundColor: '#7c3aed' })}
                    />
                    <ShapeBtn
                      icon={Square}
                      label="Rounded"
                      onClick={() => onAddNode('shape', { shapeType: 'rounded', borderRadius: 16, width: 180, height: 120, backgroundColor: '#7c3aed' })}
                    />
                    <ShapeBtn
                      icon={Circle}
                      label="Circle"
                      onClick={() => onAddNode('shape', { shapeType: 'circle', borderRadius: 9999, width: 140, height: 140, backgroundColor: '#ec4899' })}
                    />
                    <ShapeBtn
                      icon={Square}
                      label="Pill Button"
                      onClick={() => onAddNode('shape', { shapeType: 'pill', borderRadius: 9999, width: 220, height: 54, backgroundColor: '#00c4cc' })}
                    />
                    <ShapeBtn
                      icon={Star}
                      label="Star"
                      onClick={() => onAddNode('shape', { shapeType: 'star', width: 120, height: 120, backgroundColor: '#fbbf24' })}
                    />
                    <ShapeBtn
                      icon={Triangle}
                      label="Triangle"
                      onClick={() => onAddNode('shape', { shapeType: 'triangle', width: 120, height: 120, backgroundColor: '#ef4444' })}
                    />
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Lines & Accents
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onAddNode('shape', { shapeType: 'rectangle', width: 300, height: 4, backgroundColor: '#7c3aed' })}
                      style={presetRowStyle}
                    >
                      <Minus size={16} /> <span>Horizontal Divider Line</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddNode('shape', { shapeType: 'pill', width: 160, height: 8, backgroundColor: '#00c4cc', borderRadius: 4 })}
                      style={presetRowStyle}
                    >
                      <Minus size={16} /> <span>Thick Accent Bar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TEXT TAB */}
            {activeTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() =>
                    onAddNode('text', {
                      text: 'Add a heading',
                      fontSize: 48,
                      fontWeight: '900',
                      width: 500,
                      height: 70,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    })
                  }
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    textAlign: 'left',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  Add a heading
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAddNode('text', {
                      text: 'Add a subheading',
                      fontSize: 28,
                      fontWeight: '700',
                      width: 420,
                      height: 50,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    })
                  }
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    textAlign: 'left',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  Add a subheading
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAddNode('text', {
                      text: 'Add a little bit of body text. Clear, legible, and easy to read across all platforms.',
                      fontSize: 16,
                      fontWeight: '400',
                      width: 400,
                      height: 80,
                      fontFamily: 'Inter, sans-serif',
                    })
                  }
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Add body text
                </button>
              </div>
            )}

            {/* BRAND KIT TAB */}
            {activeTab === 'brand' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  1-Click Color Palettes
                </span>
                {BRAND_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => onApplyTheme(theme.colors)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ fontSize: '12px', color: '#0f172a' }}>{theme.name}</strong>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {theme.colors.map((c) => (
                        <div
                          key={c}
                          style={{
                            flex: 1,
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: c,
                          }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* UPLOADS TAB */}
            {activeTab === 'uploads' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '2px dashed #cbd5e1',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <Upload size={24} color="#7c3aed" />
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Upload Media</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>PNG, JPG, SVG up to 25MB</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Stock Library
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
                    {STOCK_IMAGES.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onAddNode('image', { src, width: 360, height: 240 })}
                        style={{
                          height: '90px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <img src={src} alt="Stock" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI STUDIO TAB (Google Imagen 3) */}
            {activeTab === 'ai' && (
              <form onSubmit={handleGenerateAiImage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Prompt
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., A minimalist gradient glass sphere floating over abstract geometry..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Style Preset
                  </label>
                  <select
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <option value="Photorealistic, 8k resolution, cinematic lighting">Photorealistic & Cinematic</option>
                    <option value="Minimalist 3D vector illustration, clay render">3D Clay / Vector</option>
                    <option value="Cyberpunk neon lighting, vibrant synthwave">Cyberpunk Neon</option>
                    <option value="Clean modern editorial typography, bauhaus poster">Editorial Poster</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={aiGenerating || !aiPrompt.trim()}
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
                    cursor: aiGenerating ? 'not-allowed' : 'pointer',
                    opacity: aiGenerating || !aiPrompt.trim() ? 0.7 : 1,
                  }}
                >
                  {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{aiGenerating ? 'Generating Asset...' : 'Generate with Imagen 3'}</span>
                </button>
              </form>
            )}

            {/* LAYERS TAB */}
            {activeTab === 'layers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#f3e8ff' : '#f8fafc',
                        border: isSelected ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#7c3aed' : '#0f172a' }}>
                        {node.name || `${node.kind} (${node.id.slice(0, 6)})`}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderNode(node.id, 'up');
                          }}
                          style={tinyBtnStyle}
                          title="Move Layer Up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderNode(node.id, 'down');
                          }}
                          style={tinyBtnStyle}
                          title="Move Layer Down"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(node.id);
                          }}
                          style={tinyBtnStyle}
                          title="Toggle Visibility"
                        >
                          {node.hidden ? <EyeOff size={12} color="#94a3b8" /> : <Eye size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(node.id);
                          }}
                          style={tinyBtnStyle}
                          title="Toggle Lock"
                        >
                          {node.locked ? <Lock size={12} color="#e11d48" /> : <Unlock size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNode(node.id);
                          }}
                          style={{ ...tinyBtnStyle, color: '#ef4444' }}
                          title="Delete Layer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RailBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        width: '56px',
        height: '56px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: active ? '#f3e8ff' : 'transparent',
        color: active ? '#7c3aed' : '#64748b',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <Icon size={18} />
      <span style={{ fontSize: '10px', fontWeight: 700 }}>{label}</span>
    </button>
  );
}

function ShapeBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: '64px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 700,
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

const presetRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '12px',
  fontWeight: 700,
  color: '#0f172a',
  cursor: 'pointer',
};

const tinyBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#64748b',
  cursor: 'pointer',
};
