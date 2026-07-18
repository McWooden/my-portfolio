"use client";
import React, { useState, useEffect } from 'react';
import { blogPosts as staticBlogPosts } from '../data/siteData';
import Contact from '../components/Utils/Contact';
import SectionHeader from '../components/Utils/SectionHeader';
import StoryCard from '../components/Utils/StoryCard';
import Section from '../components/Utils/Section';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase, mapStory } from '../utils/supabase';

export default function Blog({ posts: initialPosts = staticBlogPosts }) {
  const [posts, setPosts] = useState([]);
  const [gridRef, isRevealed] = useScrollReveal(0.05);

  const fetchUpdatedPosts = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, accounts(*)')
      .eq('published', true)
      .eq('type', 'blog')
      .order('date', { ascending: false });

    if (!error && data) {
      setPosts(data.map(mapStory));
    }
  };

  useEffect(() => {
    if (initialPosts && initialPosts.length > 0 && initialPosts[0].author) {
      setPosts(initialPosts);
    } else {
      fetchUpdatedPosts();
    }
  }, [initialPosts]);

  return (
    <div className="pt-[140px] max-[810px]:pt-[100px] bg-bg-dark">
      
      {/* 1. Page Section Header */}
      <div className="w-full max-w-[1600px] mx-auto px-5 xl:px-10 mb-[60px]">
        <SectionHeader
          index="04"
          tag="Latest articles"
          name="Blog"
          title="Behind The Work: Passion Projects, Documented"
          subtitle="Notes from behind the screen"
        />
      </div>

      {/* 2. Blog Grid Section */}
      <Section id="blog-grid" extraClass="py-0">
        <div 
          ref={gridRef}
          className="flex flex-col gap-6 w-full max-w-[800px] mx-auto"
        >
          {posts.map((post, index) => (
            <StoryCard 
              key={post.slug} 
              story={post} 
              onStoryUpdate={fetchUpdatedPosts}
              className={`reveal-item ${isRevealed ? 'revealed' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </Section>

      {/* 3. Contact */}
      <Contact />
    </div>
  );
}
