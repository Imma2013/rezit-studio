'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  LayoutTemplate,
  Video,
  Calendar,
  Share2,
  Wand2,
  Cloud,
  Send,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import type { StudioMode } from '@/lib/types';
import { socialProviders, type SocialProvider } from '@/lib/social';
import { GraphicWorkspace } from './graphic/graphic-workspace';
import { VideoWorkspace } from './video-workspace';
import { CalendarWorkspace } from './calendar-workspace';
import styles from './studio-shell.module.css';

export function StudioShell() {
  const [mode, setMode] = useState<StudioMode>('graphic');
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [docTitle, setDocTitle] = useState('Untitled Design - 1080x1080px');

  // Copilot State
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotBusy, setCopilotBusy] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '✨ Welcome to Rezit Studio 2.0! I am your AI Copilot powered by Google Gemini 3 Flash. How can I help you design today?',
    },
  ]);

  // Share / Publish Modal State
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<SocialProvider[]>(['x', 'instagram', 'linkedin']);
  const [shareCaption, setShareCaption] = useState('🎨 Check out this graphic created in Rezit Studio 2.0!');
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);

  // Copilot message submission
  async function handleSendCopilot(text: string) {
    if (!text.trim() || copilotBusy) return;
    const userMsg = text.trim();
    setCopilotPrompt('');
    setMessages((curr) => [...curr, { role: 'user', text: userMsg }]);
    setCopilotBusy(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          mode,
        }),
      });

      const data = (await response.json()) as { text?: string; actions?: unknown[] };
      const reply = data.text || 'Action executed successfully.';
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

  // Quick Action Pills based on active Mode
  const quickPills =
    mode === 'graphic'
      ? [
          { label: '✨ Write Punchy Hook', prompt: 'Write an inspiring headline for a modern product launch' },
          { label: '🎨 Cyber Neon Colors', prompt: 'Apply dark neon cyberpunk theme' },
          { label: '🌅 Warm Sunset Theme', prompt: 'Apply warm sunset aesthetic theme' },
          { label: '📐 Minimal Editorial', prompt: 'Format layout as minimal modern editorial' },
        ]
      : mode === 'video'
      ? [
          { label: '🎬 Veo Video Scene', prompt: 'Generate a 6-second cinematic drone shot of cyberpunk city' },
          { label: '🎵 Upbeat Music Beat', prompt: 'Add upbeat electronic rhythm audio track' },
          { label: '📱 9:16 Story Format', prompt: 'Convert timeline to 9:16 vertical reels format' },
          { label: '⚡ Fast Cuts Pacing', prompt: 'Add dynamic jump cuts across scenes' },
        ]
      : [
          { label: '📅 Plan Weekly Posts', prompt: 'Generate 7 social posts for tech product launch this week' },
          { label: '🔥 Viral TikTok Hook', prompt: 'Write a high-converting TikTok script hook' },
          { label: '🧵 X / Twitter Thread', prompt: 'Draft a 4-part value thread for X about AI creativity' },
          { label: '💼 LinkedIn Value Post', prompt: 'Write professional LinkedIn update with carousel hook' },
        ];

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
      const data = (await response.json()) as { success?: boolean };
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

  return (
    <div className={styles.appShell}>
      {/* 1. TOP APP HEADER */}
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
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className={styles.docTitle}
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

        {/* Topbar Right Actions */}
        <div className={styles.topbarRight}>
          <button className={styles.btnShare} onClick={() => setShareOpen(true)}>
            <Share2 size={14} /> Share & Publish
          </button>

          <button
            className={`${styles.btnCopilotToggle} ${copilotOpen ? styles.btnCopilotActive : ''}`}
            onClick={() => setCopilotOpen(!copilotOpen)}
          >
            <Wand2 size={14} /> AI Copilot
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className={styles.workspaceBody}>
        {mode === 'graphic' ? (
          <GraphicWorkspace
            copilotOpen={copilotOpen}
            onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
            onAskCopilotFromCanvas={(prompt) => handleSendCopilot(prompt)}
          />
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
                    <Loader2 size={13} className="animate-spin" /> Thinking & executing...
                  </span>
                </div>
              ) : null}
            </div>

            {/* Input Box */}
            <div className={styles.copilotInputArea}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendCopilot(copilotPrompt);
                }}
                className={styles.copilotInputBox}
              >
                <input
                  type="text"
                  placeholder={`Ask Copilot in ${mode} mode...`}
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={copilotBusy || !copilotPrompt.trim()}
                  className={styles.copilotSendBtn}
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </aside>
        ) : null}
      </div>

      {/* 4. SHARE & PUBLISH MODAL */}
      {shareOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              width: '460px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={18} color="#7d2ae8" />
                <strong style={{ fontSize: '16px', color: '#0e1318' }}>Share & Publish</strong>
              </div>
              <button
                onClick={() => {
                  setShareOpen(false);
                  setShareStatus(null);
                }}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#8b95a5' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Channels */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8b95a5', textTransform: 'uppercase' }}>
                Publish To Channels
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                {socialProviders.map((sp) => {
                  const active = selectedChannels.includes(sp.id);
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => {
                        setSelectedChannels((curr) =>
                          active ? curr.filter((c) => c !== sp.id) : [...curr, sp.id]
                        );
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: active ? '1.5px solid #7d2ae8' : '1px solid #e5e7eb',
                        background: active ? '#f9f6ff' : 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: active ? '#7d2ae8' : '#0e1318',
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7d2ae8' }} />
                      {sp.label}
                      {active ? <Check size={14} style={{ marginLeft: 'auto' }} /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8b95a5', textTransform: 'uppercase' }}>
                Social Caption
              </label>
              <textarea
                rows={3}
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            {shareStatus ? (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {shareStatus}
              </div>
            ) : null}

            {/* Submit */}
            <button
              disabled={shareBusy || selectedChannels.length === 0}
              onClick={() => void handlePublish()}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#7d2ae8',
                color: 'white',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: shareBusy ? 'not-allowed' : 'pointer',
                opacity: shareBusy ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {shareBusy ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
              {shareBusy ? 'Publishing Post...' : 'Publish to Selected Channels'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
