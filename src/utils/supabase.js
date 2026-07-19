import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export function mapProject(dbProject) {
  if (!dbProject) return null;
  return {
    id: dbProject.id,
    slug: dbProject.slug,
    title: dbProject.title,
    subtitle: dbProject.subtitle,
    date: dbProject.date,
    location: dbProject.location,
    industry: dbProject.industry,
    featured: dbProject.featured,
    published: dbProject.published ?? false,
    coverImage: dbProject.cover_image,
    testimonial: dbProject.testimonial_quote ? {
      quote: dbProject.testimonial_quote,
      author: dbProject.testimonial_author,
      company: dbProject.testimonial_company
    } : null,
    content: dbProject.content
  };
}

export function mapBlog(dbBlog) {
  if (!dbBlog) return null;
  return {
    id: dbBlog.id,
    slug: dbBlog.slug,
    title: dbBlog.title,
    subtitle: dbBlog.subtitle,
    date: dbBlog.date,
    category: dbBlog.category,
    published: dbBlog.published ?? false,
    coverImage: dbBlog.cover_image,
    content: dbBlog.content
  };
}

export function mapStory(dbStory) {
  if (!dbStory) return null;

  let meta = null;
  if (dbStory.testimonial_company && dbStory.testimonial_company.trim().startsWith('{')) {
    try {
      meta = JSON.parse(dbStory.testimonial_company);
    } catch (_) {}
  }

  return {
    id: dbStory.id,
    slug: dbStory.slug,
    title: dbStory.title,
    subtitle: dbStory.subtitle,
    date: dbStory.date,
    type: dbStory.type || 'blog',
    published: dbStory.published ?? false,
    coverImage: dbStory.cover_image,
    content: dbStory.content,
    location: dbStory.location || '',
    industry: dbStory.industry || '',
    featured: dbStory.featured || false,
    testimonial: dbStory.testimonial_quote ? {
      quote: dbStory.testimonial_quote,
      author: dbStory.testimonial_author,
      company: dbStory.testimonial_company
    } : null,
    category: dbStory.category || '',
    
    // Extracted custom fields
    author: dbStory.accounts ? {
      name: dbStory.accounts.name || 'Huddin',
      username: dbStory.accounts.username || 'huddin',
      avatar: dbStory.accounts.avatar_url || 'https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png',
      bio: dbStory.accounts.bio || '',
      id: dbStory.account_id
    } : (meta?.author || {
      name: 'Huddin',
      username: 'huddin',
      avatar: 'https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png',
      email: 'halohuddin@gmail.com',
      id: 'admin'
    }),
    claps: meta?.claps || 0,
    claps_by_user: meta?.claps_by_user || {},
    isPremium: meta?.isPremium || false,
    price: meta?.price || null,
    currency: meta?.currency || 'USD',
    ratingValue: meta?.ratingValue || null,
    ratingCount: meta?.ratingCount || null
  };
}

