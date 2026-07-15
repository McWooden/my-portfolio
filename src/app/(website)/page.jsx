import React from 'react';
import Home from '../../views/Home';
import { supabase, mapStory } from '../../utils/supabase';
import { faqs as staticFaqs, reviews as staticReviews } from '../../data/siteData';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Fetch raw data from Supabase stories table
  const { data: dbStories, error: storiesError } = await supabase
    .from('stories')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });

  if (storiesError) {
    console.error('Error fetching stories from Supabase:', storiesError);
  }

  const allStories = (dbStories || []).map(mapStory);
  const allProjects = allStories.filter(s => s.type === 'project');
  const allBlogs = allStories.filter(s => s.type === 'blog');

  // Fallback / homepageData configuration
  const homepageData = {
    status: 'available',
    openSlots: 2,
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

  // 3. Filter featured projects: projects marked as featured, or first 4
  const featured = allProjects.filter(p => p.featured);
  const projectsData = featured.length > 0 ? featured : allProjects.slice(0, 4);

  // 4. Filter featured blogs: first 4 blog posts
  const blogsData = allBlogs.slice(0, 4);

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

