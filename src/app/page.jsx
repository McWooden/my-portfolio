import React from 'react';
import Home from '../views/Home';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import { getImageUrl } from '../utils/image';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const reader = createReader(process.cwd(), keystaticConfig);

  // 1. Fetch raw data
  const homepageData = (await reader.singletons.homepage.read()) || {
    status: 'available',
    openSlots: 3,
    heroTestimonialProject: 'onyx-skincare',
    featuredProjects: [],
    featuredBlogs: []
  };

  const allProjects = await reader.collections.projects.all();
  const allBlogs = await reader.collections.blog.all();
  const allFaqs = await reader.collections.faqs.all();
  const allReviews = await reader.collections.reviews.all();

  // 2. Resolve dynamic testimonial card
  let testimonialCard = null;
  const testimonialProjectSlug = homepageData.heroTestimonialProject || 'onyx-skincare';
  const testProject = allProjects.find(p => p.slug === testimonialProjectSlug);
  if (testProject) {
    testimonialCard = {
      slug: testimonialProjectSlug,
      quote: testProject.entry.testimonial?.quote || '',
      author: testProject.entry.testimonial?.author || '',
      company: testProject.entry.testimonial?.company || '',
      coverImage: getImageUrl(testProject.entry.coverImage) || null
    };
  }

  // 3. Filter featured projects in homepage configuration order
  const featuredProjectSlugs = homepageData.featuredProjects || [];
  let projectsData = [];
  if (featuredProjectSlugs.length > 0) {
    projectsData = featuredProjectSlugs
      .map(slug => allProjects.find(p => p.slug === slug))
      .filter(Boolean)
      .map(item => ({ slug: item.slug, ...item.entry }));
  } else {
    // Fallback: projects marked as featured, or first 4
    const filtered = allProjects.filter(p => p.entry.featured);
    const sourceList = filtered.length > 0 ? filtered : allProjects;
    projectsData = sourceList.slice(0, 4).map(item => ({ slug: item.slug, ...item.entry }));
  }

  // 4. Filter featured blogs in homepage configuration order
  const featuredBlogSlugs = homepageData.featuredBlogs || [];
  let blogsData = [];
  if (featuredBlogSlugs.length > 0) {
    blogsData = featuredBlogSlugs
      .map(slug => allBlogs.find(b => b.slug === slug))
      .filter(Boolean)
      .map(item => ({ slug: item.slug, ...item.entry }));
  } else {
    // Fallback: first 4 blog posts
    blogsData = allBlogs.slice(0, 4).map(item => ({ slug: item.slug, ...item.entry }));
  }

  // 5. Sort FAQs by number (slug)
  const faqsData = allFaqs
    .map(item => ({ slug: item.slug, ...item.entry }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  // 6. Map reviews
  const reviewsData = allReviews.map(item => ({ slug: item.slug, ...item.entry }));

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
