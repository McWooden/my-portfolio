"use client";
import React from 'react';
import { blogPosts as staticBlogPosts } from '../../data/siteData';
import BlogCard from '../Utils/BlogCard';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function BlogSection({ posts = staticBlogPosts }) {
  const [gridRef, isRevealed] = useScrollReveal(0.05);

  return (
    <Section id="blog">
      <SectionHeader
        index="04"
        tag="Latest articles"
        name="Blog"
        title="Behind The Work: Passion Projects, Documented"
        subtitle="Notes from behind the screen"
      />
      <div 
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-[30px] w-full max-w-[1600px]"
      >
        {posts.map((post, index) => (
          <BlogCard 
            key={post.slug} 
            post={post} 
            className={`reveal-item ${isRevealed ? 'revealed' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </Section>
  );
}
