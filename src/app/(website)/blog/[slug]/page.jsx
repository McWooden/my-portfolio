import React from 'react';
import { notFound } from 'next/navigation';
import BlogDetail from '../../../../views/BlogDetail';
import { supabase, mapStory } from '../../../../utils/supabase';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const { slug } = await params;

  // Fetch all blogs to handle ordering, prev/next, and recommendations
  const { data: dbBlogs, error } = await supabase
    .from('stories')
    .select('*')
    .eq('type', 'blog')
    .eq('published', true)
    .order('date', { ascending: false });

  if (error || !dbBlogs) {
    notFound();
  }

  const allBlogs = dbBlogs.map(mapStory);

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

