'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabase';
import { FiMoreVertical, FiBookmark, FiPlus } from 'react-icons/fi';
import { formatDate } from '../../utils/date';

export default function StoryCard({ story, onStoryUpdate }) {
  const [user, setUser] = useState(null);
  const [clapping, setClapping] = useState(false);
  const [localClaps, setLocalClaps] = useState(story.claps || 0);
  const [userClaps, setUserClaps] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        const uc = story.claps_by_user?.[session.user.id] || 0;
        setUserClaps(uc);
      }
    });
  }, [story]);

  const handleClap = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to clap!');
      return;
    }
    if (userClaps >= 50) {
      alert('You have reached the maximum of 50 claps for this story.');
      return;
    }
    if (clapping) return;

    setClapping(true);
    const newClaps = localClaps + 1;
    const newUserClaps = userClaps + 1;
    setLocalClaps(newClaps);
    setUserClaps(newUserClaps);

    try {
      const updatedClapsByUser = {
        ...(story.claps_by_user || {}),
        [user.id]: newUserClaps
      };

      const updatedMeta = {
        claps: newClaps,
        claps_by_user: updatedClapsByUser,
        author: story.author
      };

      const { error } = await supabase
        .from('stories')
        .update({
          testimonial_company: JSON.stringify(updatedMeta)
        })
        .eq('id', story.id);

      if (error) throw error;
      if (onStoryUpdate) {
        onStoryUpdate();
      }
    } catch (err) {
      console.error('Failed to update clap:', err);
      // rollback
      setLocalClaps(localClaps);
      setUserClaps(userClaps);
    } finally {
      setClapping(false);
    }
  };

  const getExcerpt = (htmlContent) => {
    if (!htmlContent) return '';
    const plainText = htmlContent.replace(/<[^>]+>/g, '');
    return plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '');
  };

  // Build the relative path link
  const storyUrl = `/stories/@${story.author?.username || 'huddin'}/${story.slug}`;

  return (
    <div className="w-full border-b border-neutral-900 py-6 text-left flex flex-col gap-3 relative group">
      {/* Top author info */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
          {story.author?.avatar ? (
            <img src={story.author.avatar} alt={story.author.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">👤</div>
          )}
        </div>
        <span className="text-xs font-semibold text-neutral-300">{story.author?.name || 'Huddin'}</span>
        <span className="text-[10px] text-neutral-600 font-mono">•</span>
        <span className="text-[10px] text-neutral-500 font-mono">{formatDate(story.date)}</span>
      </div>

      {/* Middle Content row */}
      <Link href={storyUrl} className="flex justify-between items-start gap-6 select-text">
        <div className="flex-1 flex flex-col gap-1.5">
          <h3 className="text-lg md:text-xl font-bold leading-snug text-white tracking-tight group-hover:text-accent transition-colors duration-155">
            {story.title}
          </h3>
          <p className="text-xs md:text-sm text-neutral-450 leading-relaxed line-clamp-2">
            {story.subtitle || getExcerpt(story.content)}
          </p>
        </div>

        {story.coverImage && (
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950">
            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
          </div>
        )}
      </Link>

      {/* Bottom Action row */}
      <div className="flex justify-between items-center mt-2 relative z-10">
        {/* Clap button */}
        <button
          onClick={handleClap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-850 hover:border-neutral-750 rounded-full transition-all text-neutral-400 hover:text-white select-none active:scale-95 cursor-pointer"
        >
          <span className="text-xs">👏</span>
          <span className="text-xs font-mono font-medium">{localClaps}</span>
        </button>

        {/* Right action group */}
        <div className="flex items-center gap-3">
          {/* Bookmark hidden on mobile, visible on desktop */}
          <button className="hidden md:flex items-center justify-center p-1.5 text-neutral-500 hover:text-white transition-colors cursor-pointer select-none">
            <FiBookmark className="w-4.5 h-4.5" />
          </button>
          
          {/* Ellipsis option trigger */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }}
              className="flex items-center justify-center p-1.5 text-neutral-500 hover:text-white transition-colors cursor-pointer select-none"
            >
              <FiMoreVertical className="w-4.5 h-4.5" />
            </button>

            {showOptions && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowOptions(false)} />
                <div className="absolute right-0 bottom-full mb-2 w-44 bg-neutral-950 border border-neutral-850 rounded-xl shadow-2xl py-1.5 px-1.5 z-40 text-left">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + storyUrl);
                      alert('Copied link to clipboard!');
                      setShowOptions(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-mono text-neutral-350 hover:text-white hover:bg-neutral-900 rounded-lg text-left cursor-pointer"
                  >
                    Copy Link
                  </button>
                  {user && story.author?.id === user.id && (
                    <Link
                      href={`/new-story?id=${story.id}`}
                      className="block w-full px-3 py-2 text-xs font-mono text-neutral-350 hover:text-white hover:bg-neutral-900 rounded-lg text-left"
                    >
                      Edit Story
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
