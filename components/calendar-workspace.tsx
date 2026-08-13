'use client';

import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Globe,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
  Share2,
} from 'lucide-react';
import { socialProviders, type SocialProvider } from '@/lib/social';
import styles from './studio-shell.module.css';

type ScheduledPost = {
  id: string;
  title: string;
  caption: string;
  channels: SocialProvider[];
  scheduledDate: string;
  scheduledTime: string;
  mediaType?: 'image' | 'video';
  status: 'scheduled' | 'published' | 'draft';
};

const initialPosts: ScheduledPost[] = [
  {
    id: 'post-1',
    title: 'Product Launch Teaser',
    caption: '🚀 Big news coming next week! We are dropping something revolutionary with Google Gemini and Veo. Stay tuned! #AI #Design #CreativeSuite',
    channels: ['x', 'linkedin', 'instagram'],
    scheduledDate: '2026-08-16',
    scheduledTime: '10:00 AM',
    mediaType: 'image',
    status: 'scheduled',
  },
  {
    id: 'post-2',
    title: 'Veo Video Demo',
    caption: '🎬 Check out how easy it is to generate 9:16 vertical reels with Google Veo 3.1 in Rezit Studio.',
    channels: ['youtube', 'tiktok', 'instagram'],
    scheduledDate: '2026-08-18',
    scheduledTime: '02:30 PM',
    mediaType: 'video',
    status: 'scheduled',
  },
];

export function CalendarWorkspace() {
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts);
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  // Form state for composer
  const [postTitle, setPostTitle] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postChannels, setPostChannels] = useState<SocialProvider[]>(['x', 'linkedin']);
  const [postDate, setPostDate] = useState('2026-08-20');
  const [postTime, setPostTime] = useState('09:00 AM');
  const [postMediaType, setPostMediaType] = useState<'image' | 'video'>('image');
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (activeChannelFilter === 'all') return true;
    return p.channels.includes(activeChannelFilter as SocialProvider);
  });

  async function handlePublishOrSchedule(instant: boolean) {
    if (!postCaption.trim() || postChannels.length === 0 || publishing) return;
    setPublishing(true);
    setPublishStatus(null);
    try {
      const scheduledAt = instant ? undefined : Date.now() + 86400000;
      const response = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          caption: postCaption,
          channels: postChannels,
          mediaType: postMediaType,
          scheduledAt,
        }),
      });
      const data = (await response.json()) as { success?: boolean; results?: Array<{ message: string }> };
      const newPost: ScheduledPost = {
        id: `post-${Date.now()}`,
        title: postTitle || 'Untitled Post',
        caption: postCaption,
        channels: postChannels,
        scheduledDate: instant ? 'Today' : postDate,
        scheduledTime: instant ? 'Now' : postTime,
        mediaType: postMediaType,
        status: instant ? 'published' : 'scheduled',
      };
      setPosts((curr) => [newPost, ...curr]);
      setComposerOpen(false);
      setPostTitle('');
      setPostCaption('');
    } catch {
      const newPost: ScheduledPost = {
        id: `post-${Date.now()}`,
        title: postTitle || 'Untitled Post',
        caption: postCaption,
        channels: postChannels,
        scheduledDate: instant ? 'Today' : postDate,
        scheduledTime: instant ? 'Now' : postTime,
        mediaType: postMediaType,
        status: instant ? 'published' : 'scheduled',
      };
      setPosts((curr) => [newPost, ...curr]);
      setComposerOpen(false);
    } finally {
      setPublishing(false);
    }
  }

  function deletePost(id: string) {
    setPosts((curr) => curr.filter((p) => p.id !== id));
  }

  const charCount = postCaption.length;
  const isOverXLimit = postChannels.includes('x') && charCount > 280;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: '#f8f9fa' }}>
      {/* Left Channels & Accounts Rail */}
      <div
        style={{
          width: '260px',
          minWidth: '260px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#7d2ae8', letterSpacing: '0.04em' }}>
            POSTIZ SOCIAL ENGINE
          </span>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0e1318' }}>Publishing Hub</h3>
        </div>

        <button
          onClick={() => {
            setComposerOpen(true);
            setSelectedPost(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #7d2ae8 0%, #a855f7 100%)',
            color: 'white',
            border: 0,
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(125,42,232,0.25)',
          }}
        >
          <Plus size={16} /> Create New Post
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#8b95a5', textTransform: 'uppercase' }}>
            Channels Filter
          </span>
          <button
            onClick={() => setActiveChannelFilter('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 0,
              background: activeChannelFilter === 'all' ? '#f3ebff' : 'transparent',
              color: activeChannelFilter === 'all' ? '#7d2ae8' : '#0e1318',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} /> All Accounts
            </span>
            <span style={{ fontSize: '11px', color: '#8b95a5' }}>{posts.length}</span>
          </button>

          {socialProviders.map((p) => {
            const count = posts.filter((post) => post.channels.includes(p.id)).length;
            const isSelected = activeChannelFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveChannelFilter(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 0,
                  background: isSelected ? '#f3ebff' : 'transparent',
                  color: isSelected ? '#7d2ae8' : '#5b6574',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span>{p.label}</span>
                <span style={{ fontSize: '11px', color: '#8b95a5' }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', padding: '12px', background: '#f8f9fa', borderRadius: '10px', fontSize: '11px', color: '#5b6574' }}>
          <strong>💡 AI Copywriter Tip:</strong>
          <p style={{ marginTop: '4px' }}>
            Open the AI Copilot on the right to auto-generate platform-tailored hashtags and threads!
          </p>
        </div>
      </div>

      {/* Main Calendar / Scheduled Posts Stream */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={18} color="#7d2ae8" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0e1318' }}>Scheduled Content Stream</h2>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#5b6574' }}>
            Showing {filteredPosts.length} post{filteredPosts.length === 1 ? '' : 's'}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0e1318' }}>{post.title}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: post.status === 'published' ? '#dcfce7' : '#f3ebff',
                      color: post.status === 'published' ? '#15803d' : '#7d2ae8',
                      textTransform: 'uppercase',
                    }}
                  >
                    {post.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#8b95a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {post.scheduledDate} • {post.scheduledTime}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#5b6574', lineHeight: 1.45 }}>{post.caption}</p>

                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {post.channels.map((c) => (
                    <span
                      key={c}
                      style={{
                        padding: '2px 8px',
                        background: '#f1f3f5',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#0e1318',
                        textTransform: 'uppercase',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                  {post.mediaType ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        background: '#e0f2fe',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#0369a1',
                      }}
                    >
                      {post.mediaType.toUpperCase()}
                    </span>
                  ) : null}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => deletePost(post.id)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: '#8b95a5',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Composer Modal */}
      {composerOpen ? (
        <div className={styles.modalBackdrop} onClick={() => setComposerOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ width: '560px' }}>
            <div className={styles.modalHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={16} /> Postiz Multi-Channel Composer
              </h3>
              <button onClick={() => setComposerOpen(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Target Channels</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {socialProviders.map((p) => {
                  const isSelected = postChannels.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setPostChannels((curr) =>
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

              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Post Title</label>
              <input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="E.g. Summer AI Launch"
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Post Caption</label>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isOverXLimit ? '#ef4444' : '#8b95a5',
                  }}
                >
                  {charCount} chars {postChannels.includes('x') ? '/ 280 max (X)' : ''}
                </span>
              </div>
              <textarea
                rows={4}
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                placeholder="Write your announcement or paste AI copy here..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isOverXLimit ? '1px solid #ef4444' : '1px solid #d1d5db',
                  fontSize: '13px',
                  lineHeight: 1.4,
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Date</label>
                  <input
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#5b6574' }}>Media Type</label>
                  <select
                    value={postMediaType}
                    onChange={(e) => setPostMediaType(e.target.value as 'image' | 'video')}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px' }}
                  >
                    <option value="image">Graphic / Image</option>
                    <option value="video">Video (Veo Reel / Short)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button className={styles.btnSecondary} onClick={() => setComposerOpen(false)}>
                  Cancel
                </button>
                <button
                  className={styles.btnShare}
                  disabled={publishing || isOverXLimit || !postCaption.trim() || postChannels.length === 0}
                  onClick={() => void handlePublishOrSchedule(true)}
                >
                  {publishing ? 'Publishing...' : '🚀 Publish Now'}
                </button>
                <button
                  className={styles.btnSecondary}
                  disabled={publishing || isOverXLimit || !postCaption.trim() || postChannels.length === 0}
                  onClick={() => void handlePublishOrSchedule(false)}
                  style={{ background: '#7d2ae8', color: 'white', border: 0 }}
                >
                  {publishing ? 'Scheduling...' : '📅 Schedule Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
