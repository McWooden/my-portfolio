import React from 'react';
import Hero from '../components/Home/Hero';
import PortfolioSection from '../components/Home/PortfolioSection';
import ReviewsSection from '../components/Home/ReviewsSection';
import BlogSection from '../components/Home/BlogSection';
import Contact from '../components/Utils/Contact';

export default function Home({ projects, blogPosts, reviews, homepageData, testimonialCard }) {
  return (
    <div className="bg-transparent">
      {/* 1. Hero Section */}
      <Hero homepageData={homepageData} testimonialCard={testimonialCard} />

      {/* 2. Services (disabled) */}

      {/* 4. Projects */}
      <PortfolioSection projects={projects} />

      {/* 5. Reviews */}
      <ReviewsSection reviews={reviews} />

      {/* 6. Blog */}
      <BlogSection posts={blogPosts} />

      {/* 7. FAQ (disabled) */}

      {/* 8. Contact */}
      <Contact />
    </div>
  );
}
