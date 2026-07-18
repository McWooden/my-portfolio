"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, mapStory } from '../../utils/supabase';
import { 
  FiFileText, FiEdit, FiTrash2, FiGlobe, FiArchive, 
  FiHome, FiUser, FiLogOut, FiPlus, FiMenu, FiBookOpen, FiGrid, FiCpu,
  FiUsers, FiSettings
} from 'react-icons/fi';

const ALLOWED_EMAILS = ['huddin8876@gmail.com', 'halohuddin@gmail.com'];

export default function StoriesDashboard({ username = 'me' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // All stories fetched from DB
  const [allStories, setAllStories] = useState([]);
  
  // Tab control
  const [activeTab, setActiveTab] = useState('published'); // default to 'published' for guest/profile views
  
  // Context Menu state
  const [contextMenu, setContextMenu] = useState(null); // { x, y, storyId }

  // Puter.js Connection state
  const [isPuterSignedIn, setIsPuterSignedIn] = useState(true); // default true to avoid layout flash

  // Mobile Drawer state (Left only, Right drawer is removed)
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Long press refs for mobile context menu
  const longPressTimeout = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isLongPressActive = useRef(false);

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  // Check Puter connection status
  useEffect(() => {
    import('@heyputer/puter.js')
      .then((module) => {
        const puter = module.default || module;
        setIsPuterSignedIn(puter.auth.isSignedIn());
      })
      .catch((err) => {
        console.warn('Puter.js load failed in stories console:', err);
        setIsPuterSignedIn(false);
      });
  }, [currentUser]);

  // Lock background body scrolling when mobile menu drawer is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isLeftDrawerOpen) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };
  }, [isLeftDrawerOpen]);

  // Get initial session and subscribe to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        // If viewing "me", drafts tab is appropriate; otherwise default to published
        if (username === 'me') {
          setActiveTab('drafts');
        }
      }
      fetchAllStoriesAndUsers();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser(session.user);
        setErrorMsg('');
      } else {
        setCurrentUser(null);
      }
      fetchAllStoriesAndUsers();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [username]);

  // Fetch all stories in the database that are accessible to build the author list and display content
  const fetchAllStoriesAndUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*, accounts(*)')
        .order('date', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(s => mapStory(s));
      setAllStories(mapped);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setErrorMsg('Failed to load stories data from database.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique authors from all stories in the database (excl. logged-in user)
  const authorsList = React.useMemo(() => {
    const map = new Map();

    // Add authors from existing stories (filter out logged-in user)
    allStories.forEach(story => {
      if (story.author && story.author.id) {
        const authorId = story.author.id;
        
        // If author is the current user, we exclude them from the list
        if (currentUser && authorId === currentUser.id) return;
        
        if (!map.has(authorId)) {
          map.set(authorId, {
            id: authorId,
            name: story.author.name || 'Author',
            username: story.author.username || 'author',
            avatar: story.author.avatar || '',
            email: story.author.email || '',
            bio: story.author.bio || 'No bio written yet.'
          });
        } else {
          // If we found a story with a richer bio/avatar, update it
          const existing = map.get(authorId);
          if (story.author.bio && story.author.bio !== 'No bio written yet.' && existing.bio === 'No bio written yet.') {
            existing.bio = story.author.bio;
          }
          if (story.author.avatar && !existing.avatar) {
            existing.avatar = story.author.avatar;
          }
        }
      }
    });

    return Array.from(map.values());
  }, [allStories, currentUser]);

  // Determine which profile is currently selected/viewed
  const selectedUser = React.useMemo(() => {
    if (!currentUser && username === 'me') {
      return null;
    }

    const curLoggedInUsername = currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0];

    if (username === 'me' || (curLoggedInUsername && username.toLowerCase() === curLoggedInUsername.toLowerCase())) {
      // Return currently logged-in user as an author object
      if (!currentUser) return null;
      return {
        id: currentUser.id,
        name: currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || currentUser.email,
        username: curLoggedInUsername,
        avatar: currentUser.user_metadata?.avatar_url || '',
        email: currentUser.email,
        bio: currentUser.user_metadata?.bio || 'No bio written yet.'
      };
    }

    // Find author by username from sidebar list
    const found = authorsList.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (found) return found;

    // Fallback if the user wrote stories but isn't resolved yet
    return {
      name: username,
      username: username,
      avatar: '',
      bio: 'This user has no profile details set yet.'
    };
  }, [username, authorsList, currentUser]);

  // Filter stories belonging to the selected user
  const selectedUserStories = React.useMemo(() => {
    if (!selectedUser) return [];
    
    // If viewing own dashboard, display all stories (already filtered by account RLS)
    if (username === 'me') {
      return allStories;
    }
    
    return allStories.filter(story => {
      // If we have an author id, match by id. Otherwise match by username
      if (selectedUser.id && story.author?.id) {
        return story.author.id === selectedUser.id;
      }
      return story.author?.username?.toLowerCase() === selectedUser.username?.toLowerCase();
    });
  }, [selectedUser, allStories, username]);

  // Filter based on selected Tab (drafts vs published)
  const filteredStories = React.useMemo(() => {
    return selectedUserStories.filter(s => 
      activeTab === 'drafts' ? !s.published : s.published
    );
  }, [selectedUserStories, activeTab]);

  // Check if viewing own dashboard
  const isOwnDashboard = currentUser && selectedUser && currentUser.id === selectedUser.id;

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
      
      const u = data.user;
      if (u && !ALLOWED_EMAILS.includes(u.email)) {
        setErrorMsg(`Access Denied: ${u.email} is not authorized.`);
        await supabase.auth.signOut();
        setCurrentUser(null);
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
      setAllStories(allStories.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete story.');
    }
  };

  const handleTogglePublish = async (storyId) => {
    const story = allStories.find(s => s.id === storyId);
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
      setAllStories(allStories.map(s => s.id === storyId ? { ...s, published: newPublished } : s));
    } catch (err) {
      alert(err.message || 'Failed to update publish status.');
    }
  };

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

  const getExcerpt = (story) => {
    if (story.subtitle) return story.subtitle;
    if (!story.content) return '';
    
    // Strip HTML tags to get clean plain text
    const cleanText = story.content.replace(/<[^>]+>/g, '').trim();
    if (!cleanText) return '';
    
    if (cleanText.length <= 300) {
      return cleanText;
    }
    return cleanText.substring(0, 300) + '...';
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'yesterday';

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Context Menu touch handlers
  const handleTouchStart = (e, storyId) => {
    if (!isOwnDashboard) return;
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
    if (!isOwnDashboard) return;
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      storyId
    });
  };

  const handleCardClick = (storyId) => {
    if (!isOwnDashboard) return; // Guests can only read, not edit
    if (isLongPressActive.current) {
      isLongPressActive.current = false;
      return;
    }
    router.push(`/new-story?id=${storyId}`);
  };

  // Sidebar Layout Renderers
  const renderLeftSidebar = (isDrawer) => (
    <div className="flex flex-col gap-5 select-none pl-1 h-full min-h-[inherit]">
      {/* Brand logo (desktop sidebar only) */}
      {!isDrawer && (
        <Link
          href="/"
          className="font-serif text-[24px] font-black text-white hover:text-accent transition-colors duration-150 tracking-tight mr-1 cursor-pointer select-none inline-block pl-1 mb-1"
        >
          Huddin
        </Link>
      )}

      {/* Navigation List (Borderless, Clean, Tight Spacing) */}
      <div className="flex flex-col gap-2.5">
        {/* Home */}
        <Link
          href="/"
          className="flex items-center gap-3 py-1.5 text-[14px] text-text-secondary hover:text-accent transition-all duration-150 cursor-pointer font-mono uppercase tracking-wider pl-1"
          onClick={() => setIsLeftDrawerOpen(false)}
        >
          <FiHome className="w-4 h-4 text-text-muted" />
          <span>Home</span>
        </Link>
        
        {/* Blog */}
        <Link
          href="/blog"
          className="flex items-center gap-3 py-1.5 text-[14px] text-text-secondary hover:text-accent transition-all duration-150 cursor-pointer font-mono uppercase tracking-wider pl-1"
          onClick={() => setIsLeftDrawerOpen(false)}
        >
          <FiBookOpen className="w-4 h-4 text-text-muted" />
          <span>Blog</span>
        </Link>

        {/* Stories (me) */}
        {currentUser && (
          <Link
            href="/me/stories"
            className={`flex items-center gap-3 py-1.5 text-[14px] transition-all duration-150 cursor-pointer font-mono uppercase tracking-wider pl-1 ${
              username === 'me'
                ? 'text-accent font-bold'
                : 'text-text-secondary hover:text-accent'
            }`}
            onClick={() => setIsLeftDrawerOpen(false)}
          >
            <FiGrid className="w-4 h-4" />
            <span>Stories</span>
          </Link>
        )}

        {/* Write */}
        {currentUser && (
          <Link
            href="/new-story"
            className="flex items-center gap-3 py-1.5 text-[14px] text-text-secondary hover:text-accent transition-all duration-150 cursor-pointer font-mono uppercase tracking-wider pl-1"
            onClick={() => setIsLeftDrawerOpen(false)}
          >
            <FiEdit className="w-4 h-4 text-text-muted" />
            <span>Write</span>
          </Link>
        )}

        {/* Profile */}
        {currentUser && (
          <Link
            href="/me/profile"
            className="flex items-center gap-3 py-1.5 text-[14px] text-text-secondary hover:text-accent transition-all duration-150 cursor-pointer font-mono uppercase tracking-wider pl-1"
            onClick={() => setIsLeftDrawerOpen(false)}
          >
            <FiUser className="w-4 h-4 text-text-muted" />
            <span>Profile</span>
          </Link>
        )}

        {/* Account */}
        {currentUser && (
          <Link
            href="/me/account"
            className="flex items-center gap-3 py-1.5 text-[14px] text-text-secondary hover:text-accent transition-all duration-150 cursor-pointer font-mono uppercase tracking-wider pl-1"
            onClick={() => setIsLeftDrawerOpen(false)}
          >
            <FiUsers className="w-4 h-4 text-text-muted" />
            <span>Account</span>
          </Link>
        )}

        {/* API */}
        {currentUser && (
          <Link
            href="/me/api"
            className="flex items-center gap-3 py-1.5 text-[14px] text-text-secondary hover:text-accent transition-all duration-150 cursor-pointer font-mono uppercase tracking-wider pl-1"
            onClick={() => setIsLeftDrawerOpen(false)}
          >
            <FiSettings className="w-4 h-4 text-text-muted" />
            <span>API Settings</span>
          </Link>
        )}
      </div>

      {/* Separator line between Nav and Authors list */}
      <div className="h-[1px] bg-border/30 w-full" />

      {/* Authors List (Borderless, Only Avatar and Name, single text line) */}
      <div className="flex flex-col gap-2">
        {authorsList.map((author) => {
          const isSelected = selectedUser && selectedUser.username.toLowerCase() === author.username.toLowerCase();
          const isCurrentUser = currentUser && currentUser.id === author.id;
          
          return (
            <button
              key={author.id || author.username}
              onClick={() => {
                setIsLeftDrawerOpen(false);
                if (isCurrentUser) {
                  router.push('/me/stories');
                } else {
                  router.push(`/${author.username}/stories`);
                }
              }}
              className={`w-full text-left py-1.5 flex items-center gap-3 transition-all duration-150 cursor-pointer pl-1 ${
                isSelected
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary hover:text-accent'
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-border/30 bg-bg-dark shrink-0">
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted bg-bg-dark">👤</div>
                )}
              </div>
              <div className="text-[14px] truncate leading-none">
                {author.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Puter connection reminder card (pushed to bottom, dark background, sans font, bot icon) */}
      {isOwnDashboard && !isPuterSignedIn && (
        <div className="mt-auto pt-6 pl-1">
          <div className="w-full p-4 rounded-[20px] bg-neutral-950/90 border border-neutral-900 text-text-secondary text-[12px] font-sans leading-relaxed text-left flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-primary text-[11px]">
              <FiCpu className="w-3.5 h-3.5 text-text-muted" />
              <span>Connect Puter.js</span>
            </div>
            <p className="leading-normal text-text-secondary/80 font-normal">
              Integrate your Puter.js account to unlock writing AI assistance.
            </p>
            <Link 
              href="/me/profile" 
              className="text-accent underline font-semibold mt-1 block hover:text-white font-normal"
              onClick={() => setIsLeftDrawerOpen(false)}
            >
              Connect Now →
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const renderRightSidebar = (isDrawer) => (
    <div className="flex flex-col gap-6">
      {selectedUser ? (
        <div className="flex flex-col gap-5 py-2">
          {/* Avatar and Name/Username Row */}
          <div className="flex items-center gap-4 w-full text-left">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-border bg-bg-dark shrink-0">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-text-muted bg-bg-dark">👤</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[18px] font-semibold text-text-primary truncate leading-snug">{selectedUser.name}</h3>
              <p className="text-[12px] font-mono text-text-muted truncate mt-0.5">@{selectedUser.username}</p>
            </div>
          </div>

          <div className="w-full text-left">
            <span className="text-[10px] font-mono tracking-[0.05em] uppercase text-text-muted block mb-1.5">Bio</span>
            <p className="text-[14px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {selectedUser.bio || 'No bio written yet.'}
            </p>
          </div>

          {/* Edit Profile & Log Out inline inside Profile Panel */}
          {isOwnDashboard && (
            <div className="flex gap-2.5 w-full mt-2">
              <Link 
                href="/me/profile" 
                className="flex-1 text-center py-2.5 border border-border hover:border-border-focus text-text-secondary hover:text-text-primary rounded-xl text-xs font-mono transition-all cursor-pointer"
              >
                Edit
              </Link>
              <Link 
                href="/logout" 
                className="flex-1 text-center py-2.5 border border-border hover:border-red-900/50 hover:bg-red-950/15 text-text-muted hover:text-red-400 rounded-xl text-xs font-mono transition-all cursor-pointer"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-bg-card border border-border border-dashed rounded-[30px] p-6 text-center text-text-muted text-xs font-mono py-12">
          Select an author to view profile details.
        </div>
      )}
    </div>
  );

  // Loading state
  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center text-text-primary">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-6 font-mono text-sm tracking-widest text-text-muted uppercase">Synchronizing stories dashboard...</p>
      </div>
    );
  }

  // Auth gate if trying to view "me" or write dashboard but not logged in
  if (!currentUser && username === 'me') {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[440px] bg-bg-card border border-border rounded-[30px] p-8 md:p-10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent/20 to-accent/5 border border-accent/30 text-accent font-mono text-2xl font-bold tracking-tight mb-4 shadow-[0_0_20px_rgba(224,255,111,0.15)]">
              W
            </Link>
            <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Publisher Dashboard</h2>
            <p className="text-sm text-text-secondary mt-1.5">Sign in to manage your drafts and posts</p>
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
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white text-black hover:bg-neutral-100 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-[20px] font-medium transition-all duration-200 shadow-lg shadow-white/5 active:scale-[0.98] cursor-pointer"
            >
              Sign In with Google
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                className="text-xs text-text-muted hover:text-text-primary font-mono tracking-tight transition-all duration-200 cursor-pointer"
              >
                {showPasswordLogin ? 'Hide backup authentication' : 'Use backup credentials'}
              </button>
            </div>

            {showPasswordLogin && (
              <form onSubmit={handlePasswordLogin} className="mt-4 border-t border-border pt-4 flex flex-col gap-3">
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-text-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@huddin.dev"
                    className="w-full px-4 py-2.5 bg-bg-dark border border-border rounded-xl text-sm text-text-primary placeholder-neutral-600 focus:outline-none focus:border-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-text-muted mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-bg-dark border border-border rounded-xl text-sm text-text-primary placeholder-neutral-600 focus:outline-none focus:border-accent/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3 bg-bg-dark hover:bg-bg-card-hover border border-border hover:border-border-focus text-text-primary rounded-[20px] text-sm font-medium transition-all duration-200 cursor-pointer"
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

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col font-sans relative overflow-x-hidden pt-0 lg:pt-16">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Mobile Top Navbar (sticky/fixed below lg) */}
      <header className="lg:hidden w-full h-[64px] border-b border-border bg-bg-dark/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 select-none">
        <button 
          onClick={() => setIsLeftDrawerOpen(true)}
          className="p-2.5 border border-border rounded-xl text-text-secondary hover:text-text-primary cursor-pointer active:scale-95 transition-all"
          title="Open Menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Action Buttons: Avatar Profile Dropdown like /new-story */}
        <div className="relative">
          {currentUser ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileDropdown(!showProfileDropdown);
                }}
                className="w-9 h-9 rounded-full overflow-hidden border border-neutral-800 hover:border-neutral-700 focus:outline-none flex items-center justify-center cursor-pointer transition-colors duration-150"
                title="User menu"
              >
                {currentUser?.user_metadata?.avatar_url ? (
                  <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-48 bg-neutral-950/95 backdrop-blur-xl border border-neutral-900 rounded-2xl py-2 px-1.5 shadow-2xl flex flex-col gap-0.5 z-50">
                    <Link
                      href="/me/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                    >
                      <FiUser className="w-3.5 h-3.5" /> Settings
                    </Link>
                    <Link
                      href="/new-story"
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                    >
                      <FiPlus className="w-3.5 h-3.5" /> New Story
                    </Link>
                    <div className="h-[1px] bg-neutral-900/60 my-1" />
                    <Link
                      href="/logout"
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-4 py-2 hover:bg-red-950/40 hover:text-red-400 rounded-xl text-xs text-red-500 transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
                    >
                      <FiLogOut className="w-3.5 h-3.5" /> Log Out
                    </Link>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>
      </header>

      {/* Main Dashboard Layout (Grid) */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 md:px-12 py-6 md:py-10 z-10 grid grid-cols-1 lg:grid-cols-4 gap-[30px]">
        
        {/* Left Column (Desktop) */}
        <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6 lg:sticky lg:top-[130px] lg:max-h-[calc(100vh-160px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
          {renderLeftSidebar(false)}
        </aside>

        {/* Center Column */}
        <main className="lg:col-span-2 flex flex-col gap-6">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center pb-2">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-text-primary">
                {selectedUser ? `${selectedUser.name}'s Stories` : 'Stories'}
              </h1>
            </div>
          </div>

          {/* Tabs Switcher Inline (One Linear) with Write Button */}
          <div className="flex justify-between items-center border-b border-border pb-px text-[14px] font-sans">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('drafts')}
                className={`pb-3.5 relative transition-colors duration-150 cursor-pointer ${
                  activeTab === 'drafts' ? 'text-text-primary font-bold' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Drafts {selectedUserStories.filter(s => !s.published).length > 0 && `(${selectedUserStories.filter(s => !s.published).length})`}
                {activeTab === 'drafts' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('published')}
                className={`pb-3.5 relative transition-colors duration-150 cursor-pointer ${
                  activeTab === 'published' ? 'text-text-primary font-bold' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Published {selectedUserStories.filter(s => s.published).length > 0 && `(${selectedUserStories.filter(s => s.published).length})`}
                {activeTab === 'published' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            </div>
            {isOwnDashboard && (
              <button
                onClick={() => router.push('/new-story')}
                className="px-4 py-2 bg-accent hover:bg-white text-bg-dark font-semibold rounded-full text-[11px] font-mono transition-all duration-200 uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(224,255,111,0.15)] active:scale-95 mb-2 cursor-pointer"
              >
                <FiEdit className="w-3.5 h-3.5" /> <span>Write</span>
              </button>
            )}
          </div>

          {/* Stories Listing */}
          {activeTab === 'drafts' && !isOwnDashboard ? (
            // Drafts are private message
            <div className="py-20 text-center border border-dashed border-border rounded-[30px] bg-bg-card/25 backdrop-blur-sm flex flex-col items-center justify-center">
              <FiArchive className="text-3xl text-text-muted mb-3" />
              <h3 className="text-sm font-semibold text-text-secondary mb-1">Drafts are private</h3>
              <p className="text-xs text-text-muted max-w-[280px] mx-auto leading-relaxed">
                Only the author can view and manage their unfinished draft stories.
              </p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border rounded-[30px] bg-bg-card/25 backdrop-blur-sm flex flex-col items-center justify-center">
              <FiFileText className="text-3xl text-text-muted mb-3" />
              <h3 className="text-sm font-semibold text-text-secondary mb-1">No stories found</h3>
              <p className="text-xs text-text-muted max-w-[280px] mx-auto leading-relaxed">
                This user has no {activeTab} yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
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
                    className={`py-6 md:py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-200 select-none relative group w-full ${
                      isOwnDashboard ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex-1 text-left min-w-0 flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
                      <div className="w-full md:w-32 h-36 md:h-24 shrink-0 rounded-[20px] overflow-hidden border border-border bg-bg-dark flex items-center justify-center">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={story.title || 'Draft'} 
                            className="w-full h-full object-cover pointer-events-none" 
                          />
                        ) : (
                          <FiFileText className="w-8 h-8 text-text-muted opacity-40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                        {/* Title link points to detail page if published */}
                        {story.published ? (
                          <Link 
                            href={`/stories/${story.author?.username || 'huddin'}/${story.slug}`} 
                            onClick={(e) => e.stopPropagation()} // don't open editor in own dashboard
                            className="text-[20px] md:text-[22px] font-semibold text-text-primary tracking-[-0.02em] mb-1 hover:text-accent transition-colors block break-words line-clamp-2"
                          >
                            {story.title || 'Untitled Story'}
                          </Link>
                        ) : (
                          <h3 className="text-[20px] md:text-[22px] font-semibold text-text-primary tracking-[-0.02em] mb-1 break-words line-clamp-2">
                            {story.title || 'Untitled Draft'}
                          </h3>
                        )}
                        
                        {getExcerpt(story) && (
                          <p className="text-[14px] text-text-secondary line-clamp-2 leading-relaxed mb-2">
                            {getExcerpt(story)}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted uppercase tracking-[0.05em] mt-auto">
                          <span className="opacity-70">
                            {story.type}
                          </span>
                          <span className="text-border font-sans font-normal">•</span>
                          <span className="opacity-70">
                            {getReadTime(story)}
                          </span>
                          <span className="text-border font-sans font-normal">•</span>
                          <span className="opacity-70">
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
        </main>

        {/* Right Column (Desktop) */}
        <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6">
          {renderRightSidebar(false)}
        </aside>

      </div>

      {/* Left Drawer (Mobile menu/navigation) */}
      <div className={`fixed inset-y-0 left-0 w-[300px] max-w-[85vw] bg-bg-card border-r border-border p-6 z-50 custom-scrollbar transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${isLeftDrawerOpen ? 'translate-x-0 overflow-y-auto' : '-translate-x-full overflow-y-hidden'}`}>
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4 shrink-0">
          <Link
            href="/"
            className="font-serif text-[22px] font-black text-white hover:text-accent transition-colors duration-150 tracking-tight cursor-pointer select-none"
            onClick={() => setIsLeftDrawerOpen(false)}
          >
            Huddin
          </Link>
          <button onClick={() => setIsLeftDrawerOpen(false)} className="text-text-muted hover:text-text-primary font-mono text-xs cursor-pointer">✕ Close</button>
        </div>
        <div className="flex-1 min-h-0">
          {renderLeftSidebar(true)}
        </div>
      </div>
      {isLeftDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsLeftDrawerOpen(false)}
        />
      )}

      {/* Context Menu Panel */}
      {contextMenu && (() => {
        const contextStory = allStories.find(s => s.id === contextMenu.storyId);
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
              className="fixed bg-bg-card border border-border rounded-2xl shadow-2xl py-2 px-1.5 w-44 z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
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
                className="w-full text-left px-3.5 py-2 hover:bg-bg-dark rounded-xl text-xs font-mono text-text-secondary hover:text-text-primary flex items-center gap-2 cursor-pointer"
              >
                {isPublished ? (
                  <>
                    <FiArchive className="w-3.5 h-3.5 text-text-muted" /> Move to Drafts
                  </>
                ) : (
                  <>
                    <FiGlobe className="w-3.5 h-3.5 text-text-muted" /> Publish Story
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
                className="w-full text-left px-3.5 py-2 hover:bg-bg-dark rounded-xl text-xs font-mono text-text-secondary hover:text-text-primary flex items-center gap-2 cursor-pointer"
              >
                <FiEdit className="w-3.5 h-3.5 text-text-muted" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(contextMenu.storyId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-red-950/20 hover:text-red-400 rounded-xl text-xs font-mono text-red-500 flex items-center gap-2 cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5 text-red-500" /> Delete
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}
