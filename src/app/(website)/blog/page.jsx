import React from 'react';
import Blog from '../../../views/Blog';
import { supabase, mapStory } from '../../../utils/supabase';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog',
  description: 'Baca artikel dan insight dari Huddin tentang web development, UI/UX design, branding, dan teknologi terkini. Developer blog dari Magelang, Jawa Tengah.',
  openGraph: {
    title: 'Blog | Huddin - Magelang Developer',
    description: 'Artikel dan insight tentang web development, UI/UX design, branding, dan teknologi dari Huddin.',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default async function Page() {
  const { data: dbBlogs, error } = await supabase
    .from('stories')
    .select('*, accounts(*)')
    .eq('published', true)
    .eq('type', 'blog')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blogs from Supabase:', error);
  }

  const posts = (dbBlogs || []).map(mapStory);

  // Sort posts by date descending
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return <Blog posts={sortedPosts} />;
}
