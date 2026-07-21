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
import { PiHandsClappingFill, PiHandsClappingLight } from 'react-icons/pi';
import { preventOrphans } from '../../../../utils/text';

const isSubtitleDuplicate = (subtitle, content) => {
  if (!subtitle || !content) return false;
  const match = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return false;
  const firstParaText = match[1]
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lh;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  return firstParaText === subtitle.trim();
};

const getReadTime = (htmlContent) => {
  if (!htmlContent) return '1 min read';
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 200);
  return `${readTime} min read`;
};

export default function StoryDetailPage({ params }) {
  const containerRef = useRef(null);
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState(null);
  const [user, setUser] = useState(null);
  const [clapping, setClapping] = useState(false);
  const [localClaps, setLocalClaps] = useState(0);
  const [userClaps, setUserClaps] = useState(0);
  const [isClapPopping, setIsClapPopping] = useState(false);
  const [showPlus, setShowPlus] = useState(false);

  const clapIntervalRef = useRef(null);
  const plusTimeoutRef = useRef(null);
  const userRef = useRef(user);
  const localClapsRef = useRef(localClaps);
  const userClapsRef = useRef(userClaps);
  const storyRef = useRef(story);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    localClapsRef.current = localClaps;
  }, [localClaps]);

  useEffect(() => {
    userClapsRef.current = userClaps;
  }, [userClaps]);

  useEffect(() => {
    storyRef.current = story;
  }, [story]);

  useEffect(() => {
    return () => {
      if (clapIntervalRef.current) {
        clearInterval(clapIntervalRef.current);
      }
      if (plusTimeoutRef.current) {
        clearTimeout(plusTimeoutRef.current);
      }
    };
  }, []);

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

  const saveClapsToDatabase = async () => {
    const finalLocalClaps = localClapsRef.current;
    const finalUserClaps = userClapsRef.current;
    const currentUser = userRef.current;
    const currentStory = storyRef.current;

    if (!currentUser || !currentStory) return;

    try {
      const updatedClapsByUser = {
        ...(currentStory.claps_by_user || {}),
        [currentUser.id]: finalUserClaps
      };

      const updatedMeta = {
        claps: finalLocalClaps,
        claps_by_user: updatedClapsByUser,
        author: currentStory.author
      };

      const { error } = await supabase
        .from('stories')
        .update({
          testimonial_company: JSON.stringify(updatedMeta)
        })
        .eq('id', currentStory.id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update clap in database:', err);
    }
  };

  const startClapping = () => {
    if (!userRef.current) {
      alert('Please log in to clap!');
      return;
    }

    if (userClapsRef.current >= 50) {
      alert('You have reached the maximum of 50 claps for this story.');
      return;
    }

    // Do one immediate clap
    incrementClap();

    // Start interval for rapid claps
    clapIntervalRef.current = setInterval(() => {
      if (userClapsRef.current >= 50) {
        stopClapping();
        alert('You have reached the maximum of 50 claps for this story.');
        return;
      }
      incrementClap();
    }, 300);
  };

  const incrementClap = () => {
    const nextLocal = localClapsRef.current + 1;
    const nextUser = userClapsRef.current + 1;

    setLocalClaps(nextLocal);
    setUserClaps(nextUser);

    setIsClapPopping(true);
    setTimeout(() => setIsClapPopping(false), 200);

    // Show "+" sign next to count and hide it 3 seconds after the last action
    setShowPlus(true);
    if (plusTimeoutRef.current) {
      clearTimeout(plusTimeoutRef.current);
    }
    plusTimeoutRef.current = setTimeout(() => {
      setShowPlus(false);
    }, 3000);
  };

  const stopClapping = () => {
    if (clapIntervalRef.current) {
      clearInterval(clapIntervalRef.current);
      clapIntervalRef.current = null;
      saveClapsToDatabase();
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

  // Build dynamic JSON-LD for Search Engines
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": story.title,
    "description": story.subtitle || story.title,
    "image": [
      story.coverImage || "https://halohuddin.vercel.app/hero-bg.webp"
    ],
    "datePublished": story.date ? new Date(story.date).toISOString() : new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": story.author?.name || "Huddin"
    }
  };

  if (story.isPremium) {
    blogLd.isAccessibleForFree = "False";
    blogLd.hasPart = {
      "@type": "WebPageElement",
      "isAccessibleForFree": "False",
      "cssSelector": ".paywall"
    };

    if (story.price) {
      blogLd.offers = {
        "@type": "Offer",
        "price": String(story.price),
        "priceCurrency": story.currency || "USD",
        "category": "membership"
      };
    }
  }

  if (story.ratingValue) {
    blogLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": String(story.ratingValue),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": String(story.ratingCount || 1)
    };
  }

  return (
    <>
      <ProgressBar />
      <Header />

      {story && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
          />
          {/* Also keep VideoObject for rich media results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": story.title,
                "description": story.subtitle || story.title,
                "thumbnailUrl": [
                  story.coverImage || "https://halohuddin.vercel.app/hero-bg.webp"
                ],
                "uploadDate": story.date ? new Date(story.date).toISOString() : new Date().toISOString(),
                "contentUrl": "https://halohuddin.vercel.app/videos/marketing-ai.webm",
                "embedUrl": `https://halohuddin.vercel.app/stories/${unwrappedParams?.username}/${unwrappedParams?.slug}`,
                "duration": "PT0M49S",
                ...(story.ratingValue ? {
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": String(story.ratingValue),
                    "bestRating": "5",
                    "worstRating": "1",
                    "ratingCount": String(story.ratingCount || 1)
                  }
                } : {})
              })
            }}
          />
        </>
      )}

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
          <header className="mb-0 pb-6">
            <div className="flex items-center gap-3 font-mono text-xs text-accent mb-4 uppercase tracking-widest">
              <span>{story.category || 'Story'}</span>
            </div>
            <h1 className="text-[2.2rem] md:text-[3.2rem] font-bold leading-tight text-white mb-4 tracking-tight">
              {story.title}
            </h1>
            {story.subtitle && !isSubtitleDuplicate(story.subtitle, story.content) && (
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
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-neutral-400">
                <span className="font-semibold text-neutral-200 hover:text-white transition-colors">
                  {story.author?.name || 'Huddin'}
                </span>
                <span className="text-neutral-700 font-mono">·</span>
                <span className="font-mono text-neutral-400">{getReadTime(story.content)}</span>
                <span className="text-neutral-700 font-mono">·</span>
                <span className="font-mono text-neutral-400">{formatDate(story.date)}</span>
              </div>
            </div>
          </header>

          {/* Interaction Bar */}
          <div className="py-3.5 flex justify-between items-center text-neutral-500 text-sm mb-10">
            {/* Left side actions */}
            <div className="flex items-center gap-5">
              {/* Claps */}
              <button 
                onMouseDown={startClapping}
                onMouseUp={stopClapping}
                onMouseLeave={stopClapping}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startClapping();
                }}
                onTouchEnd={stopClapping}
                className="flex items-center gap-2 hover:text-neutral-350 transition-colors group cursor-pointer select-none"
                title="Clap (Hold to add more)"
              >
                {userClaps > 0 ? (
                  <PiHandsClappingFill className="w-[18px] h-[18px] text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                ) : (
                  <PiHandsClappingLight className="w-[18px] h-[18px] text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                )}
                <span className={`text-xs font-mono font-medium text-neutral-400 group-hover:text-white transition-colors inline-block ${isClapPopping ? 'animate-emoji-pop' : ''}`}>
                  {showPlus ? '+' : ''}{localClaps}
                </span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Share */}
              <button className="hover:text-neutral-350 transition-colors cursor-pointer" title="Share">
                <svg className="w-[18px] h-[18px] stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>



          {/* Article Content */}
          <article className={`prose prose-invert max-w-none text-[1.125rem] leading-[1.7] text-neutral-300 mb-16 ${story.isPremium ? 'paywall' : ''}`}>
            <div 
              className="blog-document-content"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          </article>

          {/* Bottom Interaction Bar */}
          <div className="py-3.5 flex justify-between items-center text-neutral-500 text-sm mb-10">
            {/* Left side actions */}
            <div className="flex items-center gap-5">
              {/* Claps */}
              <button 
                onMouseDown={startClapping}
                onMouseUp={stopClapping}
                onMouseLeave={stopClapping}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startClapping();
                }}
                onTouchEnd={stopClapping}
                className="flex items-center gap-2 hover:text-neutral-350 transition-colors group cursor-pointer select-none"
                title="Clap (Hold to add more)"
              >
                {userClaps > 0 ? (
                  <PiHandsClappingFill className="w-[18px] h-[18px] text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                ) : (
                  <PiHandsClappingLight className="w-[18px] h-[18px] text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                )}
                <span className={`text-xs font-mono font-medium text-neutral-400 group-hover:text-white transition-colors inline-block ${isClapPopping ? 'animate-emoji-pop' : ''}`}>
                  {showPlus ? '+' : ''}{localClaps}
                </span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Share */}
              <button className="hover:text-neutral-350 transition-colors cursor-pointer" title="Share">
                <svg className="w-[18px] h-[18px] stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
