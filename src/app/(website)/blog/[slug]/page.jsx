import React from 'react';
import { notFound } from 'next/navigation';
import BlogDetail from '../../../../views/BlogDetail';
import { supabase, mapStory } from '../../../../utils/supabase';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from('stories')
    .select('title, subtitle, cover_image, slug')
    .eq('slug', slug)
    .eq('type', 'blog')
    .eq('published', true)
    .single();

  if (error || !post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.subtitle || `Baca artikel "${post.title}" oleh Huddin — Developer & Designer di Magelang.`,
    openGraph: {
      title: `${post.title} | Huddin Blog`,
      description: post.subtitle || `Artikel oleh Huddin tentang ${post.title}.`,
      type: 'article',
      images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : [],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

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
