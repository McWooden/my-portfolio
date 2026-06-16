import React from 'react';
import { notFound } from 'next/navigation';
import BlogDetail from '../../../views/BlogDetail';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../../keystatic.config';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const { slug } = await params;
  const reader = createReader(process.cwd(), keystaticConfig);

  const allBlogs = (await reader.collections.blog.all()).map(item => ({
    slug: item.slug,
    ...item.entry
  }));

  // Sort posts by date descending
  const sortedPosts = allBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const post = sortedPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const idx = sortedPosts.findIndex(p => p.slug === slug);
  const prevPost = idx > 0 ? sortedPosts[idx - 1] : null;
  const nextPost = idx < sortedPosts.length - 1 ? sortedPosts[idx + 1] : null;
  const otherPosts = sortedPosts.filter(p => p.slug !== slug).slice(0, 2);

  return (
    <BlogDetail 
      post={post}
      prevPost={prevPost}
      nextPost={nextPost}
      otherPosts={otherPosts}
    />
  );
}
