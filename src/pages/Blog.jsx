import React from 'react';
import { blogPosts } from '../data/siteData';
import Contact from '../components/Utils/Contact';
import SectionHeader from '../components/Utils/SectionHeader';
import BlogCard from '../components/Utils/BlogCard';
import Section from '../components/Utils/Section';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Blog() {
  const [gridRef, isRevealed] = useScrollReveal(0.05);

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
          className="grid grid-cols-1 md:grid-cols-2 gap-[30px] w-full"
        >
          {blogPosts.map((post, index) => (
            <BlogCard 
              key={post.slug} 
              post={post} 
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
