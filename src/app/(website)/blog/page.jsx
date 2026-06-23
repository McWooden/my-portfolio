import React from 'react';
import Blog from '../../../views/Blog';
import { supabase, mapStory } from '../../../utils/supabase';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { data: dbBlogs, error } = await supabase
    .from('stories')
    .select('*')
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

