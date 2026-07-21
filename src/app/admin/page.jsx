'use client';

import React, { useState, useEffect } from 'react';
import { supabase, mapStory } from '../../utils/supabase';

const ALLOWED_EMAILS = ['huddin8876@gmail.com', 'halohuddin@gmail.com'];

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Homepage Site Settings (4 partitions)
  const [partitions, setPartitions] = useState(['open', 'open', 'me', 'working']);

  const handlePartitionChange = (idx, value) => {
    setPartitions(prev => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  // Auth checking
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch stories & homepage settings once authorized
  useEffect(() => {
    if (!user || !ALLOWED_EMAILS.includes(user.email)) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch stories
        const { data: storiesData, error: storiesError } = await supabase
          .from('stories')
          .select('*, accounts(*)')
          .eq('published', true);

        if (storiesError) throw storiesError;

        const mapped = (storiesData || []).map(mapStory);
        mapped.sort((a, b) => {
          if (a.featured && b.featured) {
            return (a.featured_order ?? 999) - (b.featured_order ?? 999);
          }
          if (a.featured) return -1;
          if (b.featured) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setStories(mapped);

        // 2. Fetch homepage site settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'homepage')
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }

        if (settingsData?.value) {
          if (settingsData.value.partitions && Array.isArray(settingsData.value.partitions)) {
            setPartitions(settingsData.value.partitions);
          } else {
            // Fallback from old schema
            const fallbackParts = [];
            const openCount = Number(settingsData.value.openSlots) || 0;
            const isWorking = settingsData.value.status === 'working' || settingsData.value.status === 'busy';
            for (let i = 0; i < 4; i++) {
              if (i < openCount) fallbackParts.push('open');
              else if (isWorking) fallbackParts.push('working');
              else fallbackParts.push('campus');
            }
            setPartitions(fallbackParts);
          }
        }

      } catch (err) {
        console.error('Error fetching admin data:', err);
        setMessage({ type: 'error', text: 'Failed to load settings: ' + err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle toggling featured state
  const handleToggleFeatured = (id) => {
    setStories((prevStories) => {
      const story = prevStories.find(s => s.id === id);
      if (!story) return prevStories;

      const isFeatured = !story.featured;
      const type = story.type;

      const featuredOfType = prevStories.filter(s => s.id !== id && s.type === type && s.featured);

      return prevStories.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            featured: isFeatured,
            featured_order: isFeatured ? featuredOfType.length : null
          };
        }
        return s;
      });
    });
  };

  // Move featured item up or down in order
  const handleMove = (id, direction) => {
    const storyToMove = stories.find(s => s.id === id);
    if (!storyToMove) return;

    const type = storyToMove.type;
    const featuredStories = stories
      .filter(s => s.type === type && s.featured)
      .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0));

    const index = featuredStories.findIndex(s => s.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featuredStories.length) return;

    const temp = featuredStories[index].featured_order;
    featuredStories[index].featured_order = featuredStories[targetIndex].featured_order;
    featuredStories[targetIndex].featured_order = temp;

    setStories((prevStories) => {
      return prevStories.map((s) => {
        const updated = featuredStories.find(fs => fs.id === s.id);
        return updated ? { ...s, featured_order: updated.featured_order } : s;
      });
    });
  };

  // Save changes to database
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // 1. Save stories featured status & order
      const storyUpdates = stories.map((s) => {
        return supabase
          .from('stories')
          .update({
            featured: s.featured,
            featured_order: s.featured ? s.featured_order : null
          })
          .eq('id', s.id);
      });

      // 2. Save homepage site settings
      const settingsUpdate = supabase
        .from('site_settings')
        .upsert({
          key: 'homepage',
          value: { partitions }
        });

      const results = await Promise.all([...storyUpdates, settingsUpdate]);
      const error = results.find(r => r.error);
      if (error) throw error.error;

      setMessage({ type: 'success', text: 'Admin settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-neutral-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-sm text-neutral-400 mb-6">Please log in to manage homepage settings.</p>
          <a
            href="/login"
            className="inline-block w-full py-3 bg-accent text-neutral-950 font-bold rounded-xl transition-all duration-200 hover:bg-white hover:scale-[1.02] shadow-lg shadow-accent/10"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (!ALLOWED_EMAILS.includes(user.email)) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Your account ({user.email}) is not authorized to access this administration page.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl transition-all duration-200 hover:bg-red-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Filter Portfolios
  const projectStories = stories.filter(s => s.type === 'project');
  const featuredProjects = projectStories
    .filter(s => s.featured)
    .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0));
  const regularProjects = projectStories.filter(s => !s.featured);

  // Filter Blogs
  const blogStories = stories.filter(s => s.type === 'blog');
  const featuredBlogs = blogStories
    .filter(s => s.featured)
    .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0));
  const regularBlogs = blogStories.filter(s => !s.featured);

  return (
    <div className="min-h-screen bg-[#08080a] text-white font-sans py-12 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900/60 pb-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs font-mono text-neutral-400">
              Manage availability status, project slots, and homepage featured items.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/me/stories"
              className="px-4 py-2 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:border-neutral-600 transition-all duration-150"
            >
              Dashboard
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2.5 bg-accent text-neutral-950 font-bold text-xs rounded-xl transition-all duration-200 hover:bg-white flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className={`p-4 rounded-xl text-xs font-mono border text-center ${message.type === 'success' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Section 1: Availability Settings (4 Slots Pill) */}
        <div className="bg-neutral-900/30 border border-neutral-900 p-6 rounded-2xl flex flex-col gap-6 text-left shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Availability Settings</h2>
            {/* Live Preview of the Pill */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-full">
              <div className="flex w-8 h-2.5 rounded-full overflow-hidden shrink-0 border border-neutral-850">
                {partitions.map((val, idx) => (
                  <span 
                    key={idx}
                    className="flex-1 h-full"
                    style={{ backgroundColor: val === 'open' ? '#c6ff34' : val === 'me' ? '#6CCFF6' : val === 'working' ? '#FE7F2D' : '#AC58E9' }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
                {partitions.filter(p => p === 'open').length} Open • {partitions.filter(p => p === 'working').length} Working • {partitions.filter(p => p === 'campus').length} Campus • {partitions.filter(p => p === 'me').length} Me Time
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {partitions.map((part, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  Slot Partition {idx + 1}
                </label>
                <select
                  value={part}
                  onChange={(e) => handlePartitionChange(idx, e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white py-2.5 px-3.5 rounded-xl text-xs font-mono focus:outline-none focus:border-accent/40"
                >
                  <option value="open">🟢 Open Slot</option>
                  <option value="working">🟡 Working</option>
                  <option value="campus">🟣 Campus/Org</option>
                  <option value="me">🔵 Me Time</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Portfolios Management */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-extrabold text-left border-b border-neutral-900/60 pb-3">Portfolios Management</h2>
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono text-neutral-500">Loading portfolios...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Featured Portfolios */}
              <div className="flex flex-col gap-4">
                <h3 className="text-md font-bold flex items-center justify-between">
                  <span>Featured Portfolios</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20">
                    {featuredProjects.length} active
                  </span>
                </h3>

                {featuredProjects.length === 0 ? (
                  <div className="border border-dashed border-neutral-800 rounded-2xl p-10 text-center text-neutral-500 text-xs leading-relaxed">
                    No portfolio items are currently featured.<br />
                    Add items from the list on the right to feature them on the homepage.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {featuredProjects.map((story, idx) => (
                      <div 
                        key={story.id} 
                        className="flex items-center gap-4 bg-neutral-900/60 border border-accent/30 hover:border-accent/50 p-4 rounded-xl transition-all duration-150 relative group"
                      >
                        {story.coverImage ? (
                          <div className="w-14 aspect-video rounded-md overflow-hidden bg-neutral-850 shrink-0">
                            <img src={story.coverImage} className="w-full h-full object-cover" alt="" />
                          </div>
                        ) : (
                          <div className="w-14 aspect-video rounded-md bg-neutral-800 border border-neutral-700 shrink-0 flex items-center justify-center text-xs">
                            🖼️
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col text-left">
                          <span className="text-xs font-bold text-neutral-200 truncate">{story.title}</span>
                          <span className="text-[10px] font-mono text-neutral-500 mt-0.5">Order: {idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMove(story.id, 'up')}
                            disabled={idx === 0}
                            title="Move up"
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 cursor-pointer text-xs"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMove(story.id, 'down')}
                            disabled={idx === featuredProjects.length - 1}
                            title="Move down"
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 cursor-pointer text-xs"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(story.id)}
                            title="Remove from home"
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-red-500/10 hover:border-red-500/30 text-red-500/60 hover:text-red-400 transition-all duration-150 ml-1.5 cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Available Portfolios */}
              <div className="flex flex-col gap-4">
                <h3 className="text-md font-bold text-left">Available Portfolios</h3>

                {regularProjects.length === 0 ? (
                  <div className="border border-neutral-900 bg-neutral-900/20 rounded-2xl p-10 text-center text-neutral-500 text-xs">
                    No other published portfolios available.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {regularProjects.map((story) => (
                      <div 
                        key={story.id} 
                        className="flex items-center gap-4 bg-neutral-900/30 border border-neutral-900 hover:border-neutral-800 p-4 rounded-xl transition-all duration-150 relative"
                      >
                        {story.coverImage ? (
                          <div className="w-14 aspect-video rounded-md overflow-hidden bg-neutral-850 shrink-0">
                            <img src={story.coverImage} className="w-full h-full object-cover animate-fade-in" alt="" />
                          </div>
                        ) : (
                          <div className="w-14 aspect-video rounded-md bg-neutral-800 border border-neutral-700 shrink-0 flex items-center justify-center text-xs">
                            🖼️
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col text-left">
                          <span className="text-xs font-semibold text-neutral-400 truncate group-hover:text-neutral-200">{story.title}</span>
                          <span className="text-[10px] font-mono text-neutral-600 mt-0.5">{new Date(story.date).toLocaleDateString()}</span>
                        </div>

                        <button
                          onClick={() => handleToggleFeatured(story.id)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-accent hover:text-neutral-950 text-neutral-400 font-bold text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer"
                        >
                          Feature
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Blogs Management */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-extrabold text-left border-b border-neutral-900/60 pb-3">Blogs Management</h2>
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono text-neutral-500">Loading blogs...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Featured Blogs */}
              <div className="flex flex-col gap-4">
                <h3 className="text-md font-bold flex items-center justify-between">
                  <span>Featured Blogs</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20">
                    {featuredBlogs.length} active
                  </span>
                </h3>

                {featuredBlogs.length === 0 ? (
                  <div className="border border-dashed border-neutral-800 rounded-2xl p-10 text-center text-neutral-500 text-xs leading-relaxed">
                    No blog items are currently featured.<br />
                    Add items from the list on the right to feature them on the homepage.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {featuredBlogs.map((story, idx) => (
                      <div 
                        key={story.id} 
                        className="flex items-center gap-4 bg-neutral-900/60 border border-accent/30 hover:border-accent/50 p-4 rounded-xl transition-all duration-150 relative group"
                      >
                        {story.coverImage ? (
                          <div className="w-14 aspect-video rounded-md overflow-hidden bg-neutral-850 shrink-0">
                            <img src={story.coverImage} className="w-full h-full object-cover" alt="" />
                          </div>
                        ) : (
                          <div className="w-14 aspect-video rounded-md bg-neutral-800 border border-neutral-700 shrink-0 flex items-center justify-center text-xs">
                            🖼️
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col text-left">
                          <span className="text-xs font-bold text-neutral-200 truncate">{story.title}</span>
                          <span className="text-[10px] font-mono text-neutral-500 mt-0.5">Order: {idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMove(story.id, 'up')}
                            disabled={idx === 0}
                            title="Move up"
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 cursor-pointer text-xs"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMove(story.id, 'down')}
                            disabled={idx === featuredBlogs.length - 1}
                            title="Move down"
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 cursor-pointer text-xs"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(story.id)}
                            title="Remove from home"
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-red-500/10 hover:border-red-500/30 text-red-500/60 hover:text-red-400 transition-all duration-150 ml-1.5 cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Available Blogs */}
              <div className="flex flex-col gap-4">
                <h3 className="text-md font-bold text-left">Available Blogs</h3>

                {regularBlogs.length === 0 ? (
                  <div className="border border-neutral-900 bg-neutral-900/20 rounded-2xl p-10 text-center text-neutral-500 text-xs">
                    No other published blogs available.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {regularBlogs.map((story) => (
                      <div 
                        key={story.id} 
                        className="flex items-center gap-4 bg-neutral-900/30 border border-neutral-900 hover:border-neutral-800 p-4 rounded-xl transition-all duration-150 relative"
                      >
                        {story.coverImage ? (
                          <div className="w-14 aspect-video rounded-md overflow-hidden bg-neutral-850 shrink-0">
                            <img src={story.coverImage} className="w-full h-full object-cover animate-fade-in" alt="" />
                          </div>
                        ) : (
                          <div className="w-14 aspect-video rounded-md bg-neutral-800 border border-neutral-700 shrink-0 flex items-center justify-center text-xs">
                            🖼️
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col text-left">
                          <span className="text-xs font-semibold text-neutral-400 truncate group-hover:text-neutral-200">{story.title}</span>
                          <span className="text-[10px] font-mono text-neutral-600 mt-0.5">{new Date(story.date).toLocaleDateString()}</span>
                        </div>

                        <button
                          onClick={() => handleToggleFeatured(story.id)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-accent hover:text-neutral-950 text-neutral-400 font-bold text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer"
                        >
                          Feature
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
