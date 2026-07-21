import React from 'react';
import Home from '../../views/Home';
import { supabase, mapStory } from '../../utils/supabase';
import { faqs as staticFaqs, reviews as staticReviews } from '../../data/siteData';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Fetch raw data from Supabase stories table
  const { data: dbStories, error: storiesError } = await supabase
    .from('stories')
    .select('*, accounts(*)')
    .eq('published', true)
    .order('date', { ascending: false });

  if (storiesError) {
    console.error('Error fetching stories from Supabase:', storiesError);
  }

  const allStories = (dbStories || []).map(mapStory);
  const allProjects = allStories.filter(s => s.type === 'project');
  const allBlogs = allStories.filter(s => s.type === 'blog');

  // 1.5 Fetch homepage settings from Supabase
  const { data: settingsData, error: settingsError } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'homepage')
    .single();

  if (settingsError && settingsError.code !== 'PGRST116') {
    console.error('Error fetching homepage settings:', settingsError);
  }

  const homepageSettings = settingsData?.value || {};
  let partitions = homepageSettings.partitions;
  if (!partitions || !Array.isArray(partitions)) {
    partitions = [];
    const openCount = Number(homepageSettings.openSlots) ?? 2;
    const isWorking = homepageSettings.status === 'working' || homepageSettings.status === 'busy';
    for (let i = 0; i < 4; i++) {
      if (i < openCount) partitions.push('open');
      else if (isWorking) partitions.push('working');
      else partitions.push('campus');
    }
  }

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

  // 5. Sort FAQs
  const faqsData = [...staticFaqs].sort((a, b) => (a.number || '').localeCompare(b.number || ''));

  // 6. Map reviews
  const reviewsData = staticReviews;

  return (
    <Home 
      projects={projectsData}
      blogPosts={blogsData}
      faqs={faqsData}
      reviews={reviewsData}
      homepageData={homepageData}
      testimonialCard={testimonialCard}
    />
  );
}

