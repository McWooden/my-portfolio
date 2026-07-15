import { supabase } from '../utils/supabase';

function formatDate(dateInput) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    // Use YYYY-MM-DD format, which is safe and standard for sitemaps
    return date.toISOString().split('T')[0];
  } catch (_) {
    return new Date().toISOString().split('T')[0];
  }
}

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://halohuddin.vercel.app';

  // Base routes
  const routes = ['', '/portfolio', '/blog', '/network'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: formatDate(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch all published stories from Supabase for dynamic routes
  let projectRoutes = [];
  let blogRoutes = [];

  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('slug, type, updated_at, date')
      .eq('published', true)
      .order('date', { ascending: false });

    if (!error && stories) {
      projectRoutes = stories
        .filter((s) => s.type === 'project')
        .map((project) => ({
          url: `${baseUrl}/portfolio/${project.slug}`,
          lastModified: formatDate(project.updated_at || project.date),
          changeFrequency: 'monthly',
          priority: 0.7,
        }));

      blogRoutes = stories
        .filter((s) => s.type === 'blog')
        .map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: formatDate(post.updated_at || post.date),
          changeFrequency: 'monthly',
          priority: 0.6,
        }));
    }
  } catch (err) {
    console.error('Sitemap: Error fetching stories from Supabase:', err);
  }

  return [...routes, ...projectRoutes, ...blogRoutes];
}

