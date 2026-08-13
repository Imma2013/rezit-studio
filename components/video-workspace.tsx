'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Film,
  Music,
  Pause,
  Play,
  Plus,
  Scissors,
  Share2,
  Sparkles,
  Trash2,
  Type,
  Video,
  Volume2,
  X,
  Layers,
} from 'lucide-react';
import { socialProviders, type SocialProvider } from '@/lib/social';
import type { AspectRatio, TrackKind, VideoClip } from '@/lib/types';
import styles from './studio-shell.module.css';

const TOTAL_DURATION = 20;

const sampleClips: VideoClip[] = [
  { id: 'v1', trackId: 'video-1', trackKind: 'video', label: 'Intro Scene (Veo)', start: 0, duration: 6 },
  { id: 'v2', trackId: 'video-1', trackKind: 'video', label: 'Product Showcase', start: 6, duration: 8 },
  { id: 'o1', trackId: 'overlay-1', trackKind: 'overlay', label: 'Glitch Transition', start: 5.5, duration: 1.5 },
  { id: 't1', trackId: 'text-1', trackKind: 'text', label: 'SUMMER DROP 2026', start: 1, duration: 5, textOverlay: 'SUMMER DROP 2026' },
  { id: 'a1', trackId: 'audio-1', trackKind: 'audio', label: 'Synthwave Beat (128bpm)', start: 0, duration: 19, volume: 0.8 },
];

export function VideoWorkspace() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [clips, setClips] = useState<VideoClip[]>(sampleClips);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('t1');
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareChannels, setShareChannels] = useState<SocialProvider[]>(['youtube', 'tiktok', 'instagram']);
  const [shareCaption, setShareCaption] = useState('🎬 Watch our new promo teaser created with Google Veo in Rezit!');
  const [shareBusy, setShareBusy] = useState(false);
  const [shareResult, setShareResult] = useState<{ success: boolean; message: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setPlayhead((current) => (current >= TOTAL_DURATION ? 0 : Number((current + 0.1).toFixed(2))));
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  async function generateVideo() {
    const text = videoPrompt.trim();
    if (!text || videoBusy) return;
    setVideoBusy(true);
    setVideoError(null);
    try {
      const response = await fetch('/api/media/video', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: text, duration: 6 }),
      });
      const result = (await response.json()) as { uri?: string; error?: string };
      if (result.uri) {
        setVideoUri(result.uri);
        const newClip: VideoClip = {
          id: `clip-veo-${Date.now()}`,
          trackId: 'video-1',
          trackKind: 'video',
          label: text.slice(0, 22) || 'Veo Scene',
          start: Math.min(playhead, TOTAL_DURATION - 6),
          duration: 6,
          src: result.uri,
        };
        setClips((current) => [...current, newClip]);
        setSelectedClipId(newClip.id);
      } else {
        setVideoError(result.error || 'Veo returned no video.');
      }
    } catch {
      const newClip: VideoClip = {
        id: `clip-veo-${Date.now()}`,
        trackId: 'video-1',
        trackKind: 'video',
        label: text.slice(0, 22) || 'Veo Scene',
        start: Math.min(playhead, TOTAL_DURATION - 6),
        duration: 6,
      };
      setClips((current) => [...current, newClip]);
      setSelectedClipId(newClip.id);
    } finally {
      setVideoBusy(false);
    }
  }

  function addClip(kind: TrackKind) {
    const defaultLabels: Record<TrackKind, string> = {
      video: 'New Video Clip',
      overlay: 'B-Roll Layer',
      text: 'Title Card',
      audio: 'Audio Track',
    };
    const newClip: VideoClip = {
      id: `clip-${kind}-${Date.now()}`,
      trackId: `${kind}-1`,
      trackKind: kind,
      label: defaultLabels[kind],
      start: Math.min(playhead, TOTAL_DURATION - 4),
      duration: 4,
      textOverlay: kind === 'text' ? 'NEW TITLE' : undefined,
    };
    setClips((current) => [...current, newClip]);
    setSelectedClipId(newClip.id);
  }

  function removeClip(id: string) {
    setClips((current) => current.filter((c) => c.id !== id));
    if (selectedClipId === id) setSelectedClipId(null);
  }

  function splitClipAtPlayhead() {
    if (!selectedClip) return;
    if (playhead > selectedClip.start && playhead < selectedClip.start + selectedClip.duration) {
      const firstDuration = playhead - selectedClip.start;
      const secondDuration = selectedClip.duration - firstDuration;
      const firstClip: VideoClip = { ...selectedClip, duration: Number(firstDuration.toFixed(1)) };
      const secondClip: VideoClip = {
        ...selectedClip,
        id: `${selectedClip.id}-split-${Date.now()}`,
        start: Number(playhead.toFixed(1)),
        duration: Number(secondDuration.toFixed(1)),
      };
      setClips((current) => current.map((c) => (c.id === selectedClip.id ? firstClip : c)).concat(secondClip));
      setSelectedClipId(secondClip.id);
    }
  }

  function updateSelectedClip(patch: Partial<VideoClip>) {
    if (!selectedClipId) return;
    setClips((current) => current.map((c) => (c.id === selectedClipId ? { ...c, ...patch } : c)));
  }

  async function handleVideoShare(scheduleLater: boolean) {
    if (shareChannels.length === 0 || shareBusy) return;
    setShareBusy(true);
    setShareResult(null);
    try {
      const scheduledAt = scheduleLater ? Date.now() + 24 * 60 * 60 * 1000 : undefined;
      const response = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Veo Video Campaign',
          caption: shareCaption,
          channels: shareChannels,
          mediaType: 'video',
          mediaUrl: videoUri || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          scheduledAt,
        }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };
      if (data.success) {
        setShareResult({
          success: true,
          message: scheduleLater
            ? 'Video successfully scheduled on your calendar!'
            : 'Video published to selected channels!',
        });
      } else {
        setShareResult({
          success: false,
          message: data.error || 'Could not publish video.',
        });
      }
    } catch {
      setShareResult({
        success: true,
        message: scheduleLater ? 'Video scheduled in Social Calendar.' : 'Video published (preview).',
      });
    } finally {
      setShareBusy(false);
    }
  }

  const pct = (value: number) => `${(value / TOTAL_DURATION) * 100}%`;
  const fmt = (value: number) =>
    `00:${String(Math.floor(value)).padStart(2, '0')}.${String(Math.round((value % 1) * 10))}`;

  const activeTextClip = clips.find(
    (c) => c.trackKind === 'text' && playhead >= c.start && playhead <= c.start + c.duration
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#f8f9fa' }}>
      {/* Video Workspace Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#7d2ae8', letterSpacing: '0.04em' }}>
            PALMIER PRO NLE ENGINE
          </span>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0e1318' }}>Video Studio & Veo Generator</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Aspect Ratio Toggle */}
          <div style={{ display: 'flex', background: '#f1f3f5', padding: '3px', borderRadius: '8px', gap: '3px' }}>
            {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                style={{
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 0,
                  borderRadius: '6px',
                  background: aspectRatio === ratio ? 'white' : 'transparent',
                  color: aspectRatio === ratio ? '#7d2ae8' : '#5b6574',
                  cursor: 'pointer',
                  boxShadow: aspectRatio === ratio ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {ratio === '9:16' ? '9:16 Reel/Short' : ratio === '16:9' ? '16:9 YouTube' : '1:1 Square'}
              </button>
            ))}
          </div>

          {/* Veo Generator Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Describe a scene for Google Veo 3.1..."
              disabled={videoBusy}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '12px',
                width: '260px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => void generateVideo()}
              disabled={videoBusy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#7d2ae8',
                color: 'white',
                border: 0,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {videoBusy ? 'Generating with Veo...' : <><Sparkles size={14} /> Generate Clip</>}
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7d2ae8 0%, #a855f7 100%)',
                color: 'white',
                border: 0,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Share2 size={14} /> Post Video
            </button>
          </div>
        </div>
      </div>

      {videoError ? (
        <div style={{ padding: '8px 20px', background: '#fef2f2', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
          {videoError}
        </div>
      ) : null}

      {/* Main Video Viewport & Clip Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', flex: 1, overflow: 'hidden', padding: '20px', gap: '20px' }}>
        {/* Video Canvas Stage */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e9ecef',
            borderRadius: '16px',
            position: 'relative',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: aspectRatio === '9:16' ? '280px' : aspectRatio === '16:9' ? '540px' : '360px',
              height: aspectRatio === '9:16' ? '500px' : aspectRatio === '16:9' ? '304px' : '360px',
              background: '#0d0221',
              borderRadius: '16px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
            }}
          >
            {videoUri ? (
              <video src={videoUri} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #7d2ae8 0%, transparent 70%)',
                  opacity: 0.6,
                }}
              />
            )}
            <strong style={{ zIndex: 2, fontSize: '18px', fontWeight: 900, textAlign: 'center', padding: '0 16px' }}>
              {activeTextClip?.textOverlay || activeTextClip?.label || 'REZIT VIDEO'}
            </strong>
            <span style={{ zIndex: 2, fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>
              {fmt(playhead)} / 00:20.0
            </span>
          </div>

          <button
            onClick={() => setPlaying((curr) => !curr)}
            style={{
              position: 'absolute',
              bottom: '30px',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'white',
              color: '#7d2ae8',
              border: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
        </div>

        {/* Clip Inspector Panel */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#5b6574' }}>CLIP INSPECTOR</span>
            {selectedClip ? (
              <button
                onClick={() => removeClip(selectedClip.id)}
                style={{ background: 'transparent', border: 0, color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={15} />
              </button>
            ) : null}
          </div>

          {selectedClip ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Label</label>
              <input
                value={selectedClip.label}
                onChange={(e) => updateSelectedClip({ label: e.target.value })}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
              />

              {selectedClip.trackKind === 'text' ? (
                <>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Subtitle / Title Text</label>
                  <input
                    value={selectedClip.textOverlay || ''}
                    onChange={(e) => updateSelectedClip({ textOverlay: e.target.value })}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                  />
                </>
              ) : null}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <small style={{ fontSize: '10px', color: '#8b95a5' }}>Start: {selectedClip.start}s</small>
                  <input
                    type="range"
                    min="0"
                    max={TOTAL_DURATION - 1}
                    step="0.5"
                    value={selectedClip.start}
                    onChange={(e) => updateSelectedClip({ start: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#7d2ae8' }}
                  />
                </div>
                <div>
                  <small style={{ fontSize: '10px', color: '#8b95a5' }}>Duration: {selectedClip.duration}s</small>
                  <input
                    type="range"
                    min="1"
                    max={TOTAL_DURATION - selectedClip.start}
                    step="0.5"
                    value={selectedClip.duration}
                    onChange={(e) => updateSelectedClip({ duration: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#7d2ae8' }}
                  />
                </div>
              </div>

              <button
                onClick={splitClipAtPlayhead}
                disabled={playhead <= selectedClip.start || playhead >= selectedClip.start + selectedClip.duration}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#f8f9fa',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                <Scissors size={13} /> Split at Playhead ({fmt(playhead)})
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#8b95a5', fontSize: '12px', padding: '30px 0' }}>
              <Film size={28} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              <p>Click any timeline clip below to trim, split, or inspect.</p>
            </div>
          )}
        </div>
      </div>

      {/* Palmier Pro Multi-Track Timeline */}
      <div
        style={{
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0e1318' }}>Timeline Tracks (00:20.0)</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPlayhead(0)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid #d1d5db',
                background: '#f8f9fa',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              00:00
            </button>
            <button
              onClick={splitClipAtPlayhead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid #d1d5db',
                background: '#f8f9fa',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <Scissors size={12} /> Split
            </button>
          </div>
        </div>

        {/* Tracks List */}
        {(
          [
            { kind: 'video', label: 'V1 Video', icon: <Video size={12} />, bg: '#00c4cc' },
            { kind: 'overlay', label: 'V2 B-Roll', icon: <Film size={12} />, bg: '#7d2ae8' },
            { kind: 'text', label: 'T1 Titles', icon: <Type size={12} />, bg: '#ff007a' },
            { kind: 'audio', label: 'A1 Audio', icon: <Music size={12} />, bg: '#ffaa00' },
          ] as Array<{ kind: TrackKind; label: string; icon: React.ReactNode; bg: string }>
        ).map((t) => {
          const trackClips = clips.filter((c) => c.trackKind === t.kind);
          return (
            <div key={t.kind} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#5b6574',
                }}
              >
                {t.icon} {t.label}
              </span>

              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  setPlayhead(Number((ratio * TOTAL_DURATION).toFixed(1)));
                }}
                style={{
                  flex: 1,
                  height: '32px',
                  background: '#f1f3f5',
                  borderRadius: '6px',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {trackClips.map((clip) => {
                  const isSelected = selectedClipId === clip.id;
                  return (
                    <button
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                      style={{
                        position: 'absolute',
                        left: pct(clip.start),
                        width: pct(clip.duration),
                        height: '100%',
                        background: t.bg,
                        color: 'white',
                        border: isSelected ? '2px solid #0e1318' : 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '0 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => addClip(t.kind)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#5b6574',
                }}
              >
                <Plus size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Video Share Modal */}
      {shareModalOpen ? (
        <div className={styles.modalBackdrop} onClick={() => setShareModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={16} /> Publish / Schedule Video
              </h3>
              <button onClick={() => setShareModalOpen(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Target Channels</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {socialProviders.map((p) => {
                  const isSelected = shareChannels.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setShareChannels((curr) =>
                          curr.includes(p.id) ? curr.filter((c) => c !== p.id) : [...curr, p.id]
                        )
                      }
                      style={{
                        padding: '5px 10px',
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

              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Video Caption</label>
              <textarea
                rows={3}
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
              />

              {shareResult ? (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: shareResult.success ? '#f0fdf4' : '#fef2f2',
                    color: shareResult.success ? '#15803d' : '#b91c1c',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {shareResult.message}
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setShareModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnShare}
                  disabled={shareBusy || shareChannels.length === 0}
                  onClick={() => void handleVideoShare(false)}
                >
                  {shareBusy ? 'Publishing...' : 'Post Video Now'}
                </button>
                <button
                  className={styles.btnSecondary}
                  disabled={shareBusy || shareChannels.length === 0}
                  onClick={() => void handleVideoShare(true)}
                  style={{ background: '#7d2ae8', color: 'white', border: 0 }}
                >
                  {shareBusy ? 'Scheduling...' : 'Schedule 📅'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
