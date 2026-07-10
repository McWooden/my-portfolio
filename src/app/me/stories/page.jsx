'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, mapStory } from '../../../utils/supabase';
import { FiFileText, FiEdit, FiTrash2, FiGlobe, FiArchive } from 'react-icons/fi';

const ALLOWED_EMAILS = ['huddin8876@gmail.com', 'halohuddin@gmail.com'];

export default function StoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Stories lists
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' | 'published'

  // Context Menu state
  const [contextMenu, setContextMenu] = useState(null); // { x, y, storyId }

  // Long press refs
  const longPressTimeout = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isLongPressActive = useRef(false);

  // Auth fields for gate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  const getFirstImage = (story) => {
    if (story.coverImage) return story.coverImage;
    if (!story.content) return null;
    const match = story.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  const getReadTime = (story) => {
    const text = [story.title, story.subtitle, story.content]
      .filter(Boolean)
      .join(' ')
      .replace(/<[^>]+>/g, '');
    const wordsCount = text.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(wordsCount / 200));
    return `${mins} min read`;
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) {
      return 'just now';
    }
    if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'yesterday';
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }

    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleTouchStart = (e, storyId) => {
    if (e.touches.length !== 1) return;
    isLongPressActive.current = false;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimeout.current = setTimeout(() => {
      isLongPressActive.current = true;
      setContextMenu({
        x: touch.clientX,
        y: touch.clientY,
        storyId
      });
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 600);
  };

  const handleTouchMove = (e) => {
    if (!longPressTimeout.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const handleContextMenu = (e, storyId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      storyId
    });
  };

  const handleCardClick = (storyId) => {
    if (isLongPressActive.current) {
      isLongPressActive.current = false;
      return;
    }
    router.push(`/new-story?id=${storyId}`);
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchStories(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setErrorMsg('');
        fetchStories(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStories = async (userId) => {
    let targetUid = userId;
    if (!targetUid) {
      const { data: { session } } = await supabase.auth.getSession();
      targetUid = session?.user?.id;
    }
    if (!targetUid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', targetUid)
        .order('date', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(s => mapStory(s));
      setStories(mapped);
    } catch (err) {
      console.error('Error loading stories:', err);
      setErrorMsg('Failed to load stories from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/me/stories` : undefined,
        },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize Google login');
      setAuthLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      const currentUser = data.user;
      if (currentUser && !ALLOWED_EMAILS.includes(currentUser.email)) {
        setErrorMsg(`Access Denied: ${currentUser.email} is not authorized.`);
        await supabase.auth.signOut();
        setUser(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid login credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this story?')) return;
    
    try {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      if (error) throw error;

      // Update local state
      setStories(stories.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete story.');
    }
  };

  const handleTogglePublish = async (storyId) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    const newPublished = !story.published;
    const confirmMessage = newPublished
      ? 'Are you sure you want to publish this story?'
      : 'Are you sure you want to move this story back to drafts?';
      
    if (!confirm(confirmMessage)) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ published: newPublished })
        .eq('id', storyId);
        
      if (error) throw error;

      // Update local state
      setStories(stories.map(s => s.id === storyId ? { ...s, published: newPublished } : s));
    } catch (err) {
      alert(err.message || 'Failed to update publish status.');
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-6 font-mono text-sm tracking-widest text-neutral-400 uppercase">Verifying Console Access...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[440px] bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent/20 to-accent/5 border border-accent/30 text-accent font-mono text-2xl font-bold tracking-tight mb-4 shadow-[0_0_20px_rgba(224,255,111,0.15)]">
              W
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Publisher Dashboard</h2>
            <p className="text-sm text-neutral-400 mt-1.5">Sign in to manage your drafts and posts</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono leading-relaxed text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white text-black hover:bg-neutral-100 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-white/5 active:scale-[0.98] cursor-pointer"
            >
              Sign In with Google
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                className="text-xs text-neutral-500 hover:text-neutral-300 font-mono tracking-tight transition-all duration-200 cursor-pointer"
              >
                {showPasswordLogin ? 'Hide backup authentication' : 'Use backup credentials'}
              </button>
            </div>

            {showPasswordLogin && (
              <form onSubmit={handlePasswordLogin} className="mt-4 border-t border-neutral-800/80 pt-4 flex flex-col gap-3">
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@huddin.dev"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-accent/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filter lists based on tab choice
  const filteredStories = stories.filter(s => 
    activeTab === 'drafts' ? !s.published : s.published
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col font-sans relative">
      {/* Glow ornaments */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Main stories dashboard container */}
      <div className="flex-1 max-w-[850px] w-full mx-auto px-6 md:px-12 py-[80px] z-10">
        
        {/* Header section */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-neutral-900">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Your stories</h1>
            <p className="text-sm text-neutral-500 font-mono tracking-tight">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/new-story"
              className="px-5 py-2.5 bg-accent hover:bg-white text-bg-dark font-medium rounded-full text-xs font-mono transition-all duration-200 uppercase tracking-wider"
            >
              Write a story
            </Link>
            <Link 
              href="/logout"
              className="px-4 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-full text-xs font-mono transition-all duration-200 uppercase"
            >
              Log Out
            </Link>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex gap-6 border-b border-neutral-900/60 pb-px mb-8 font-mono text-sm">
          <button
            onClick={() => setActiveTab('drafts')}
            className={`pb-4 relative transition-colors duration-150 cursor-pointer ${
              activeTab === 'drafts' ? 'text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Drafts {stories.filter(s => !s.published).length > 0 && `(${stories.filter(s => !s.published).length})`}
            {activeTab === 'drafts' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-4 relative transition-colors duration-150 cursor-pointer ${
              activeTab === 'published' ? 'text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Published {stories.filter(s => s.published).length > 0 && `(${stories.filter(s => s.published).length})`}
            {activeTab === 'published' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        {/* Stories Listing */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <p className="mt-4 font-mono text-xs tracking-wider text-neutral-500 uppercase">Loading {activeTab}...</p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-900 rounded-3xl bg-neutral-950/20 backdrop-blur-sm flex flex-col items-center justify-center">
            <FiFileText className="text-4xl text-neutral-600 mb-4" />
            <h3 className="text-base font-semibold text-neutral-300 mb-1">No stories found</h3>
            <p className="text-xs text-neutral-500 max-w-[280px] mx-auto leading-relaxed">
              You haven't written any {activeTab} yet. Click "Write a story" above to start compose.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredStories.map((story) => {
              const imageUrl = getFirstImage(story);
              return (
                <div 
                  key={story.id}
                  onClick={() => handleCardClick(story.id)}
                  onContextMenu={(e) => handleContextMenu(e, story.id)}
                  onTouchStart={(e) => handleTouchStart(e, story.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="bg-neutral-950/40 border border-neutral-900/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-neutral-850 hover:bg-neutral-950/60 transition-all duration-200 cursor-pointer select-none relative group"
                >
                  <div className="flex-1 text-left min-w-0 flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
                    {imageUrl && (
                      <div className="w-full md:w-32 h-36 md:h-24 shrink-0 rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950">
                        <img 
                          src={imageUrl} 
                          alt={story.title || 'Draft'} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-2 truncate">
                        {story.title || 'Untitled Draft'}
                      </h3>
                      
                      {story.subtitle && (
                        <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                          {story.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                        <span className="uppercase tracking-wider opacity-60">
                          {story.type}
                        </span>
                        <span className="text-neutral-700 font-sans">•</span>
                        <span className="opacity-60">
                          {getReadTime(story)}
                        </span>
                        <span className="text-neutral-700 font-sans">•</span>
                        <span className="opacity-60">
                          {formatRelativeTime(story.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {contextMenu && (() => {
          const contextStory = stories.find(s => s.id === contextMenu.storyId);
          const isPublished = contextStory?.published;
          return (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(null);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu(null);
                }}
              />
              <div 
                className="fixed bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl py-2 px-1.5 w-44 z-50 flex flex-col gap-0.5"
                style={{ 
                  top: typeof window !== 'undefined' ? Math.min(contextMenu.y, window.innerHeight - 150) : contextMenu.y, 
                  left: typeof window !== 'undefined' ? Math.min(contextMenu.x, window.innerWidth - 190) : contextMenu.x 
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePublish(contextMenu.storyId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-neutral-900 rounded-xl text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  {isPublished ? (
                    <>
                      <FiArchive className="w-3.5 h-3.5 text-neutral-400" /> Move to Drafts
                    </>
                  ) : (
                    <>
                      <FiGlobe className="w-3.5 h-3.5 text-neutral-400" /> Publish Story
                    </>
                  )}
                </button>
                <div className="h-[1px] bg-border my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/new-story?id=${contextMenu.storyId}`);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-neutral-900 rounded-xl text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <FiEdit className="w-3.5 h-3.5 text-neutral-400" /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(contextMenu.storyId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-950/30 hover:text-red-400 rounded-xl text-xs font-mono text-red-500 flex items-center gap-2 cursor-pointer"
                >
                  <FiTrash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                </button>
              </div>
            </>
          );
        })()}

      </div>
    </div>
  );
}
