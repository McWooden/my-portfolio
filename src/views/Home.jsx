import React from 'react';
import Hero from '../components/Home/Hero';
import Ticker from '../components/Utils/Ticker';
import ServicesSection from '../components/Home/ServicesSection';
import PortfolioSection from '../components/Home/PortfolioSection';
import ReviewsSection from '../components/Home/ReviewsSection';
import BlogSection from '../components/Home/BlogSection';
import FAQ from '../components/Utils/FAQ';
import Contact from '../components/Utils/Contact';

export default function Home({ projects, blogPosts, faqs, reviews, homepageData, testimonialCard }) {
  return (
    <div className="pt-20 bg-bg-dark">
      {/* 1. Hero Section */}
      <Hero homepageData={homepageData} testimonialCard={testimonialCard} />

      {/* 2. Ticker */}
      <Ticker />

      {/* 3. Services */}
      <ServicesSection />

      {/* 4. Projects */}
      <PortfolioSection projects={projects} />

      {/* 5. Reviews */}
      <ReviewsSection reviews={reviews} />

      {/* 6. Blog */}
      <BlogSection posts={blogPosts} />

      {/* 7. FAQ */}
      <FAQ faqs={faqs} labelIndex="05" />

      {/* 8. Contact */}
      <Contact />
    </div>
  );
}
