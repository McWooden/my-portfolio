import React from 'react';
import Home from '../../views/Home';
import { supabase, mapStory } from '../../utils/supabase';
import { getHomepageSettings } from '../../utils/homepageSettings';
import { reviews as staticReviews } from '../../data/siteData';

export const revalidate = 60;

export default async function Page() {
  // 1. Fetch raw data from Supabase stories table
  const { data: dbStories, error: storiesError } = await supabase
    .from('stories')
    .select('*, accounts(*)')
    .eq('published', true)
    .order('date', { ascending: false });

  if (storiesError) {
    console.error('Error fetching stories from Supabase:', {
      message: storiesError.message,
      code: storiesError.code,
      details: storiesError.details,
      hint: storiesError.hint,
    });
  }

  const allStories = (dbStories || []).map(mapStory);
  const allProjects = allStories.filter(s => s.type === 'project');
  const allBlogs = allStories.filter(s => s.type === 'blog');

  // 2. Fetch homepage settings (shared helper)
  const { partitions } = await getHomepageSettings();

  // Fallback / homepageData configuration
  const homepageData = {
    partitions,
    heroTestimonialProject: 'onyx-skincare',
    featuredProjects: [],
    featuredBlogs: []
  };

  // 2. Resolve dynamic testimonial card
  let testimonialCard = null;
  const testimonialProjectSlug = homepageData.heroTestimonialProject || 'onyx-skincare';
  const testProject = allProjects.find(p => p.slug === testimonialProjectSlug);
  if (testProject) {
    testimonialCard = {
      slug: testimonialProjectSlug,
      quote: testProject.testimonial?.quote || '',
      author: testProject.testimonial?.author || '',
      company: testProject.testimonial?.company || '',
      coverImage: testProject.coverImage || null
    };
  }

  // 3. Filter featured projects: projects marked as featured (sorted by featured_order), or first 4
  const featured = allProjects
    .filter(p => p.featured)
    .sort((a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999));
  const projectsData = featured.length > 0 ? featured : allProjects.slice(0, 4);

  // 4. Filter featured blogs: blogs marked as featured (sorted by featured_order), or first 4
  const featuredBlogsList = allBlogs
    .filter(b => b.featured)
    .sort((a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999));
  const blogsData = featuredBlogsList.length > 0 ? featuredBlogsList : allBlogs.slice(0, 4);

  // 5. Map reviews
  const reviewsData = staticReviews;

  return (
    <Home 
      projects={projectsData}
      blogPosts={blogsData}
      reviews={reviewsData}
      homepageData={homepageData}
      testimonialCard={testimonialCard}
    />
  );
}

