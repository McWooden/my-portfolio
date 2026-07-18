'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase, mapStory } from '../../../../utils/supabase';
import { formatDate } from '../../../../utils/date';
import Header from '../../../../components/Utils/Header';
import Footer from '../../../../components/Utils/Footer';
import ProgressBar from '../../../../components/Utils/ProgressBar';
import { FiArrowLeft } from 'react-icons/fi';
import { preventOrphans } from '../../../../utils/text';

export default function StoryDetailPage({ params }) {
  const containerRef = useRef(null);
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState(null);
  const [user, setUser] = useState(null);
  const [clapping, setClapping] = useState(false);
  const [localClaps, setLocalClaps] = useState(0);
  const [userClaps, setUserClaps] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      preventOrphans(containerRef.current);
    }
  }, [story?.content]);

  useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      setUnwrappedParams(resolved);
    });
  }, [params]);

  useEffect(() => {
    if (!unwrappedParams) return;

    // Load session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    const fetchStory = async () => {
      const decodedUsername = decodeURIComponent(unwrappedParams.username);
      // Strip '@' prefix if present for queries
      const authorUsername = decodedUsername.startsWith('@') ? decodedUsername.substring(1) : decodedUsername;
      
      const { data, error } = await supabase
        .from('stories')
        .select('*, accounts(*)')
        .eq('slug', unwrappedParams.slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      const mapped = mapStory(data);
      // Validate that story author matches the username in the URL
      const mappedUsername = mapped.author?.username || 'huddin';
      if (mappedUsername.toLowerCase() !== authorUsername.toLowerCase()) {
        setLoading(false);
        return;
      }

      setStory(mapped);
      setLocalClaps(mapped.claps || 0);

      // Check current user's existing claps for this story
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && mapped.claps_by_user) {
          setUserClaps(mapped.claps_by_user[session.user.id] || 0);
        }
      });

      setLoading(false);
    };

    fetchStory();
  }, [unwrappedParams]);

  const handleClap = async () => {
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
    } catch (err) {
      console.error('Failed to update clap:', err);
      // rollback
      setLocalClaps(localClaps);
      setUserClaps(userClaps);
    } finally {
      setClapping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-6 font-mono text-sm tracking-widest text-neutral-400 uppercase">Fetching Story...</p>
      </div>
    );
  }

  if (!story) {
    notFound();
  }

  return (
    <>
      <ProgressBar />
      <Header />

      <div ref={containerRef} className="pt-24 bg-bg-dark min-h-screen text-white text-left font-sans">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 py-[80px]">
          
          {/* Back button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-white mb-10 transition-colors"
          >
            <FiArrowLeft /> Back to articles
          </Link>

          {/* Article Header */}
          <header className="mb-10 pb-8 border-b border-neutral-900">
            <div className="flex items-center gap-3 font-mono text-xs text-accent mb-4 uppercase tracking-widest">
              <span>{story.category || 'Story'}</span>
            </div>
            <h1 className="text-[2.2rem] md:text-[3.2rem] font-bold leading-tight text-white mb-4 tracking-tight">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="text-lg md:text-xl text-neutral-400 leading-normal font-light mb-6">
                {story.subtitle}
              </p>
            )}

            {/* Author details */}
            <div className="flex items-center gap-3.5 mt-6">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
                {story.author?.avatar ? (
                  <img src={story.author.avatar} alt={story.author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-neutral-600">👤</div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-200">
                  {story.author?.name || 'Huddin'}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {formatDate(story.date)}
                </span>
              </div>
            </div>
          </header>

          {/* Cover image */}
          {story.coverImage && (
            <div className="w-full rounded-[30px] overflow-hidden border border-neutral-900 mb-10 shadow-2xl aspect-[1.8]">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-invert max-w-none text-[1.125rem] leading-[1.7] text-neutral-300 mb-16">
            <div 
              className="blog-document-content"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          </article>

          {/* Bottom clap section */}
          <div className="flex flex-col items-center justify-center gap-4 py-8 border-t border-b border-neutral-900 bg-neutral-950/20 rounded-3xl p-6">
            <span className="text-xs text-neutral-400 font-mono">
              Clap for this story to show support
            </span>
            <button
              onClick={handleClap}
              className="w-16 h-16 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-full flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 text-xl cursor-pointer"
            >
              👏
            </button>
            <div className="flex flex-col items-center">
              <span className="text-base font-mono font-bold text-white">{localClaps} claps</span>
              {user && (
                <span className="text-[10px] text-neutral-500 font-mono mt-1">
                  You clapped {userClaps}/50 times
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
