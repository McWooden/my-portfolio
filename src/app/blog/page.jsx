import React from 'react';
import Blog from '../../views/Blog';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../keystatic.config';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const reader = createReader(process.cwd(), keystaticConfig);
  const posts = (await reader.collections.blog.all()).map(item => ({
    slug: item.slug,
    ...item.entry
  }));

  // Sort posts by date descending
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return <Blog posts={sortedPosts} />;
}
