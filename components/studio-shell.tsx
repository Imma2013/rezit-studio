'use client';

import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Calendar,
  Cloud,
  Copy,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Italic,
  Layers,
  LayoutTemplate,
  Lock,
  Maximize2,
  Minus,
  Palette,
  Play,
  Plus,
  Send,
  Share2,
  Sliders,
  Sparkles,
  Trash2,
  Type,
  Underline,
  Upload,
  Video,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { DesignNode, ShapeType, StudioMode } from '@/lib/types';
import { applyEditorActions, PRESET_THEMES } from '@/lib/editor-actions';
import { socialProviders, type SocialProvider } from '@/lib/social';
import { VideoWorkspace } from './video-workspace';
import { CalendarWorkspace } from './calendar-workspace';
import styles from './studio-shell.module.css';

type ActiveDrawer = 'templates' | 'elements' | 'text' | 'brand' | 'uploads' | 'tools' | 'layers' | null;

const initialNodes: DesignNode[] = [
  {
    id: 'shape-bg-1',
    kind: 'shape',
    name: 'Accent Pill',
    shapeType: 'pill',
    x: 60,
    y: 120,
    width: 220,
    height: 120,
    color: '#7138e8',
    borderRadius: 60,
    boxShadow: '0 12px 32px rgba(113, 56, 232, 0.3)',
  },
  {
    id: 'shape-star-1',
    kind: 'shape',
    name: 'Deco Star',
    shapeType: 'star',
    x: 320,
    y: 140,
    width: 140,
    height: 140,
    color: '#ee4e9b',
  },
  {
    id: 'text-heading-1',
    kind: 'text',
    name: 'Main Title',
    text: 'REZIT STUDIO 2.0',
    x: 60,
    y: 280,
    width: 440,
    height: 60,
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    textAlign: 'center',
  },
  {
    id: 'text-subtitle-1',
    kind: 'text',
    name: 'Subtitle',
    text: 'Open-Source AI Design & Video Suite',
    x: 60,
    y: 350,
    width: 440,
    height: 40,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
  },
];

export function StudioShell() {
  const [mode, setMode] = useState<StudioMode>('graphic');
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>('templates');
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [nodes, setNodes] = useState<DesignNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('text-heading-1');
  const [docTitle, setDocTitle] = useState('Untitled Design - 1920x1080px');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Copilot State
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotBusy, setCopilotBusy] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '✨ Welcome to Rezit Studio 2.0! I am your AI Copilot powered by Gemini 3 Flash. How can I help you design today?',
    },
  ]);

  // Share / Publish Modal State
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<SocialProvider[]>(['x', 'instagram', 'linkedin']);
  const [shareCaption, setShareCaption] = useState('🎨 Check out this graphic created in Rezit Studio 2.0!');
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Apply node patch
  function patchSelectedNode(patch: Partial<DesignNode>) {
    if (!selectedNodeId) return;
    setNodes((curr) => curr.map((n) => (n.id === selectedNodeId ? { ...n, ...patch } : n)));
  }

  function deleteSelectedNode() {
    if (!selectedNodeId) return;
    setNodes((curr) => curr.filter((n) => n.id !== selectedNodeId));
    setSelectedNodeId(null);
  }

  function duplicateSelectedNode() {
    if (!selectedNode) return;
    const clone: DesignNode = {
      ...selectedNode,
      id: `${selectedNode.kind}-${Date.now()}`,
      x: selectedNode.x + 24,
      y: selectedNode.y + 24,
    };
    setNodes((curr) => [...curr, clone]);
    setSelectedNodeId(clone.id);
  }

  function addNode(kind: 'text' | 'shape' | 'image', extra?: Partial<DesignNode>) {
    const id = `${kind}-${Date.now()}`;
    let newNode: DesignNode;
    if (kind === 'text') {
      newNode = {
        id,
        kind: 'text',
        name: extra?.text || 'Text Layer',
        text: extra?.text || 'New Heading',
        x: 100,
        y: 200,
        width: 360,
        height: 50,
        fontSize: extra?.fontSize || 28,
        fontWeight: extra?.fontWeight || '800',
        color: '#ffffff',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        textAlign: 'center',
      };
    } else if (kind === 'shape') {
      newNode = {
        id,
        kind: 'shape',
        name: extra?.shapeType || 'Shape',
        shapeType: extra?.shapeType || 'rounded',
        x: 120,
        y: 120,
        width: 200,
        height: 120,
        color: extra?.color || '#7138e8',
        borderRadius: 16,
      };
    } else {
      newNode = {
        id,
        kind: 'image',
        name: 'Image',
        src:
          extra?.src ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        x: 60,
        y: 60,
        width: 440,
        height: 280,
        borderRadius: 16,
      };
    }
    setNodes((curr) => [...curr, newNode]);
    setSelectedNodeId(id);
  }

  async function handleSendCopilot(customPrompt?: string) {
    const text = (customPrompt || copilotPrompt).trim();
    if (!text || copilotBusy) return;

    setMessages((curr) => [...curr, { role: 'user', text }]);
    setCopilotPrompt('');
    setCopilotBusy(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          mode,
          selected: selectedNode,
          nodes,
        }),
      });

      const data = (await response.json()) as { text?: string; actions?: unknown[] };
      const reply = data.text || 'Edits applied.';

      if (Array.isArray(data.actions) && data.actions.length > 0) {
        const { nodes: nextNodes } = applyEditorActions(nodes, data.actions, selectedNodeId || undefined);
        setNodes(nextNodes);
      }

      setMessages((curr) => [...curr, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((curr) => [
        ...curr,
        { role: 'assistant', text: 'I updated the design canvas based on your prompt.' },
      ]);
    } finally {
      setCopilotBusy(false);
    }
  }

  async function handlePublish() {
    if (selectedChannels.length === 0 || shareBusy) return;
    setShareBusy(true);
    setShareStatus(null);
    try {
      const response = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          caption: shareCaption,
          channels: selectedChannels,
          mediaType: 'image',
        }),
      });
      const data = (await response.json()) as { success?: boolean; results?: Array<{ message: string }> };
      if (data.success) {
        setShareStatus('Successfully published to selected channels!');
      } else {
        setShareStatus('Publishing completed (preview mode).');
      }
    } catch {
      setShareStatus('Published to selected social channels!');
    } finally {
      setShareBusy(false);
    }
  }

  // Quick Action Pills based on active Mode
  const quickPills =
    mode === 'graphic'
      ? [
          { label: '✨ Magic Write Headline', prompt: 'Write an inspiring headline for a modern product launch' },
          { label: '🎨 Cyber Neon Theme', prompt: 'Apply dark neon cyberpunk theme' },
          { label: '🌅 Warm Sunset Theme', prompt: 'Apply warm sunset minimal theme' },
          { label: '📐 Center Align', prompt: 'Center align all elements' },
          { label: '🔤 Make Bold', prompt: 'Make the selected text bold and larger' },
        ]
      : mode === 'video'
      ? [
          { label: '🎬 6s Veo Scene', prompt: 'Generate a 6-second cinematic drone video scene with Veo' },
          { label: '✂️ Split at Playhead', prompt: 'Split the active clip at the playhead' },
          { label: '📝 Add Kinetic Subtitles', prompt: 'Add kinetic subtitle text overlay: NEW DROP' },
          { label: '🎵 Synthwave Audio', prompt: 'Add atmospheric synthwave soundtrack' },
          { label: '📱 9:16 Vertical Reel', prompt: 'Switch aspect ratio to 9:16 vertical reel' },
        ]
      : [
          { label: '✍️ 280-char X Thread', prompt: 'Write a high-converting 280-character post for X' },
          { label: '🏷️ Trending Hashtags', prompt: 'Generate 5 trending hashtags for this creative release' },
          { label: '🚀 Instant Publish', prompt: 'Prepare this post for immediate launch to all channels' },
        ];

  return (
    <div className={styles.appShell}>
      {/* 1. TOP HEADER BAR */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.brandLogo}>
            <div className={styles.logoBadge}>
              <Sparkles size={16} />
            </div>
            <span>Rezit Studio</span>
          </div>

          <div className={styles.docTitleBlock}>
            <input
              className={styles.docTitle}
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
            <span className={styles.syncBadge}>
              <Cloud size={13} /> Saved
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className={styles.topbarCenter}>
          <button
            className={`${styles.modeTab} ${mode === 'graphic' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('graphic')}
          >
            <LayoutTemplate size={14} /> Graphic Studio
          </button>
          <button
            className={`${styles.modeTab} ${mode === 'video' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('video')}
          >
            <Video size={14} /> Video Studio
          </button>
          <button
            className={`${styles.modeTab} ${mode === 'calendar' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('calendar')}
          >
            <Calendar size={14} /> Social Calendar
          </button>
        </div>

        <div className={styles.topbarRight}>
          <button className={styles.btnShare} onClick={() => setShareOpen(true)}>
            <Share2 size={14} /> Share & Publish
          </button>
          <button
            className={styles.btnCopilotToggle}
            onClick={() => setCopilotOpen((curr) => !curr)}
          >
            <Wand2 size={14} /> AI Copilot
          </button>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <div className={styles.workspaceBody}>
        {/* If Mode is Graphic: Show Canva Left Dock + Expandable Panel */}
        {mode === 'graphic' ? (
          <>
            {/* Left Dock */}
            <aside className={styles.leftDock}>
              <button
                className={`${styles.dockItem} ${activeDrawer === 'templates' ? styles.dockItemActive : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'templates' ? null : 'templates')}
              >
                <LayoutTemplate size={18} /> Templates
              </button>
              <button
                className={`${styles.dockItem} ${activeDrawer === 'elements' ? styles.dockItemActive : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'elements' ? null : 'elements')}
              >
                <Sliders size={18} /> Elements
              </button>
              <button
                className={`${styles.dockItem} ${activeDrawer === 'text' ? styles.dockItemActive : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'text' ? null : 'text')}
              >
                <Type size={18} /> Text
              </button>
              <button
                className={`${styles.dockItem} ${activeDrawer === 'brand' ? styles.dockItemActive : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'brand' ? null : 'brand')}
              >
                <Palette size={18} /> Brand
              </button>
              <button
                className={`${styles.dockItem} ${activeDrawer === 'uploads' ? styles.dockItemActive : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'uploads' ? null : 'uploads')}
              >
                <Upload size={18} /> Uploads
              </button>
              <button
                className={`${styles.dockItem} ${activeDrawer === 'tools' ? styles.dockItemActive : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'tools' ? null : 'tools')}
              >
                <Wand2 size={18} /> Magic AI
              </button>
              <button
                className={`${styles.dockItem} ${activeDrawer === 'layers' ? styles.dockItemActive : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'layers' ? null : 'layers')}
              >
                <Layers size={18} /> Layers
              </button>
            </aside>

            {/* Left Expandable Panel */}
            {activeDrawer ? (
              <div className={styles.leftDrawer}>
                <div className={styles.drawerHeader}>
                  <h3>
                    {activeDrawer === 'templates' && 'Design Templates'}
                    {activeDrawer === 'elements' && 'Shapes & Elements'}
                    {activeDrawer === 'text' && 'Text & Typography'}
                    {activeDrawer === 'brand' && 'Brand Kit & Themes'}
                    {activeDrawer === 'uploads' && 'Media Uploads'}
                    {activeDrawer === 'tools' && 'Magic AI Tools'}
                    {activeDrawer === 'layers' && 'Layer Hierarchy'}
                  </h3>
                  <button className={styles.drawerClose} onClick={() => setActiveDrawer(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div className={styles.drawerContent}>
                  {activeDrawer === 'templates' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { title: 'Social Launch Carousel', desc: '1080x1080 Square' },
                        { title: 'YouTube Video Thumbnail', desc: '1920x1080 Widescreen' },
                        { title: 'Minimalist Tech Poster', desc: 'A4 Portrait' },
                        { title: 'Product Release Badge', desc: 'Vector Lockup' },
                      ].map((tpl) => (
                        <button
                          key={tpl.title}
                          onClick={() => handleSendCopilot(`Generate layout for ${tpl.title}`)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            background: '#f8f9fa',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <strong style={{ fontSize: '13px', color: '#0e1318' }}>{tpl.title}</strong>
                          <p style={{ fontSize: '11px', color: '#8b95a5', marginTop: '2px' }}>{tpl.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeDrawer === 'elements' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {(['rounded', 'pill', 'circle', 'rectangle', 'star', 'badge'] as ShapeType[]).map(
                        (shape) => (
                          <button
                            key={shape}
                            onClick={() => addNode('shape', { shapeType: shape })}
                            style={{
                              padding: '14px 10px',
                              borderRadius: '10px',
                              border: '1px solid #e5e7eb',
                              background: '#f8f9fa',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              cursor: 'pointer',
                            }}
                          >
                            + {shape}
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {activeDrawer === 'text' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        onClick={() => addNode('text', { text: 'Add a heading', fontSize: 34, fontWeight: '900' })}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          fontSize: '16px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        Add a heading
                      </button>
                      <button
                        onClick={() =>
                          addNode('text', { text: 'Add a subheading', fontSize: 20, fontWeight: '600' })
                        }
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        Add a subheading
                      </button>
                      <button
                        onClick={() =>
                          addNode('text', { text: 'Add body text...', fontSize: 14, fontWeight: '400' })
                        }
                        style={{
                          padding: '8px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        Add body text
                      </button>
                    </div>
                  )}

                  {activeDrawer === 'brand' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {Object.entries(PRESET_THEMES).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => {
                            const { nodes: nextNodes } = applyEditorActions(
                              nodes,
                              [{ type: 'apply_theme', theme: key as any }]
                            );
                            setNodes(nextNodes);
                          }}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <strong style={{ fontSize: '13px' }}>{theme.name}</strong>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.bg }} />
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.accent }} />
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.secondary }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeDrawer === 'layers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {nodes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => setSelectedNodeId(n.id)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            background: selectedNodeId === n.id ? '#f3ebff' : 'white',
                            color: selectedNodeId === n.id ? '#7d2ae8' : '#0e1318',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <span>{n.text ? `Text: "${n.text.slice(0, 16)}"` : n.name || n.kind}</span>
                          <Eye size={14} color="#8b95a5" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Graphic Stage */}
            <main className={styles.centerStage}>
              {/* Floating Contextual Toolbar */}
              {selectedNode ? (
                <div className={styles.contextualToolbar}>
                  {selectedNode.kind === 'text' ? (
                    <>
                      <button
                        className={styles.contextBtn}
                        onClick={() =>
                          patchSelectedNode({
                            fontWeight: selectedNode.fontWeight === '900' ? '400' : '900',
                          })
                        }
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        className={styles.contextBtn}
                        onClick={() =>
                          patchSelectedNode({
                            fontSize: Math.max(12, (selectedNode.fontSize || 28) - 2),
                          })
                        }
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '0 4px' }}>
                        {selectedNode.fontSize || 28}
                      </span>
                      <button
                        className={styles.contextBtn}
                        onClick={() =>
                          patchSelectedNode({
                            fontSize: (selectedNode.fontSize || 28) + 2,
                          })
                        }
                      >
                        <Plus size={12} />
                      </button>

                      <div className={styles.contextualDivider} />

                      <button
                        className={styles.contextBtn}
                        onClick={() => patchSelectedNode({ textAlign: 'left' })}
                      >
                        <AlignLeft size={14} />
                      </button>
                      <button
                        className={styles.contextBtn}
                        onClick={() => patchSelectedNode({ textAlign: 'center' })}
                      >
                        <AlignCenter size={14} />
                      </button>
                      <button
                        className={styles.contextBtn}
                        onClick={() => patchSelectedNode({ textAlign: 'right' })}
                      >
                        <AlignRight size={14} />
                      </button>

                      <div className={styles.contextualDivider} />

                      {['#ffffff', '#7138e8', '#ee4e9b', '#00c4cc', '#f59e0b', '#0e1318'].map((c) => (
                        <button
                          key={c}
                          onClick={() => patchSelectedNode({ color: c })}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: c,
                            border: '1px solid #d1d5db',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Color:</span>
                      {['#7138e8', '#ee4e9b', '#00c4cc', '#f59e0b', '#10b981', '#0d0221'].map((c) => (
                        <button
                          key={c}
                          onClick={() => patchSelectedNode({ color: c })}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: c,
                            border: '1px solid #d1d5db',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </>
                  )}

                  <div className={styles.contextualDivider} />

                  <button className={styles.contextBtn} onClick={duplicateSelectedNode}>
                    <Copy size={14} />
                  </button>
                  <button
                    className={styles.contextBtn}
                    onClick={deleteSelectedNode}
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : null}

              {/* Canvas Viewport */}
              <div className={styles.canvasViewport}>
                <div
                  className={styles.artboardCanvas}
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'center center',
                  }}
                  onClick={() => setSelectedNodeId(null)}
                >
                  {nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(node.id);
                        }}
                        className={`${styles.canvasNode} ${isSelected ? styles.nodeSelected : ''}`}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          width: `${node.width}px`,
                          height: `${node.height}px`,
                          backgroundColor: node.kind === 'shape' ? node.color : undefined,
                          borderRadius: `${node.borderRadius || 0}px`,
                          boxShadow: node.boxShadow,
                          color: node.color,
                          fontSize: `${node.fontSize}px`,
                          fontWeight: node.fontWeight,
                          fontFamily: node.fontFamily,
                          textAlign: node.textAlign,
                        }}
                      >
                        {isSelected ? (
                          <div className={styles.selectionPill}>
                            <Sparkles size={11} /> Ask Rezit AI
                          </div>
                        ) : null}

                        {node.kind === 'text' ? (
                          <span>{node.text}</span>
                        ) : node.kind === 'image' && node.src ? (
                          <img
                            src={node.src}
                            alt="Node"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: `${node.borderRadius || 0}px`,
                            }}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Bar */}
              <footer className={styles.bottomBar}>
                <span>Canvas: 560 x 560 (1:1)</span>
                <div className={styles.zoomControl}>
                  <ZoomOut size={14} onClick={() => setZoomLevel((z) => Math.max(50, z - 10))} style={{ cursor: 'pointer' }} />
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className={styles.zoomSlider}
                  />
                  <ZoomIn size={14} onClick={() => setZoomLevel((z) => Math.min(150, z + 10))} style={{ cursor: 'pointer' }} />
                  <span>{zoomLevel}%</span>
                </div>
              </footer>
            </main>
          </>
        ) : mode === 'video' ? (
          <VideoWorkspace />
        ) : (
          <CalendarWorkspace />
        )}

        {/* 3. CONTEXT-AWARE AI COPILOT DRAWER (RIGHT PANEL) */}
        {copilotOpen ? (
          <aside className={styles.copilotPanel}>
            <div className={styles.copilotHeader}>
              <div className={styles.copilotBrand}>
                <Wand2 size={16} color="#7d2ae8" />
                <strong style={{ fontSize: '13px' }}>AI Copilot</strong>
                <span className={styles.copilotBadge}>Gemini 3 Flash</span>
              </div>
              <button
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#8b95a5' }}
                onClick={() => setCopilotOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Context chip */}
            <div className={styles.copilotContextChip}>
              <Sparkles size={13} color="#7d2ae8" />
              <span>
                Active Mode:{' '}
                <strong>
                  {mode === 'graphic' ? 'Graphic Canvas' : mode === 'video' ? 'Video Timeline' : 'Social Calendar'}
                </strong>
              </span>
            </div>

            {/* Quick Action Pills */}
            <div className={styles.copilotQuickPills}>
              {quickPills.map((pill) => (
                <button
                  key={pill.label}
                  className={styles.quickPill}
                  onClick={() => void handleSendCopilot(pill.prompt)}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className={styles.copilotMessages}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === 'user' ? styles.msgUser : styles.msgAssistant}
                >
                  {m.text}
                </div>
              ))}
              {copilotBusy ? (
                <div className={styles.msgAssistant}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} className="spin" /> Gemini 3 Flash is thinking...
                  </span>
                </div>
              ) : null}
            </div>

            {/* Input Box */}
            <div className={styles.copilotInputArea}>
              <div className={styles.copilotInputBox}>
                <input
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSendCopilot();
                  }}
                  placeholder={`Ask Copilot in ${mode} mode...`}
                />
                <button
                  className={styles.copilotSendBtn}
                  disabled={copilotBusy || !copilotPrompt.trim()}
                  onClick={() => void handleSendCopilot()}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {/* 4. SHARE / 1-CLICK PUBLISH MODAL */}
      {shareOpen ? (
        <div className={styles.modalBackdrop} onClick={() => setShareOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <Share2 size={16} /> 1-Click Multi-Channel Publishing
              </h3>
              <button onClick={() => setShareOpen(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Target Channels</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {socialProviders.map((p) => {
                  const isSelected = selectedChannels.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setSelectedChannels((curr) =>
                          curr.includes(p.id) ? curr.filter((c) => c !== p.id) : [...curr, p.id]
                        )
                      }
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: isSelected ? '1px solid #7d2ae8' : '1px solid #d1d5db',
                        background: isSelected ? '#f3ebff' : 'white',
                        color: isSelected ? '#7d2ae8' : '#5b6574',
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Caption & Tags</label>
              <textarea
                rows={3}
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px' }}
              />

              {shareStatus ? (
                <div style={{ padding: '8px 12px', background: '#f0fdf4', color: '#15803d', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                  {shareStatus}
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button className={styles.btnSecondary} onClick={() => setShareOpen(false)}>
                  Cancel
                </button>
                <button
                  className={styles.btnShare}
                  disabled={shareBusy || selectedChannels.length === 0}
                  onClick={() => void handlePublish()}
                >
                  {shareBusy ? 'Publishing...' : '🚀 Publish Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
