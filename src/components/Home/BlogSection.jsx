import React from 'react';
import { blogPosts } from '../../data/siteData';
import BlogCard from '../Utils/BlogCard';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';

export default function BlogSection() {
  return (
    <Section id="blog">
      <SectionHeader
        index="04"
        tag="Latest articles"
        name="Blog"
        title="Behind The Work: Passion Projects, Documented"
        subtitle="Notes from behind the screen"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] w-full max-w-[1600px]">
        {blogPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </Section>
  );
}
