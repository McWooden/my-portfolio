import React from 'react';
import Hero from '../components/Home/Hero';
import Ticker from '../components/Utils/Ticker';
import ServicesSection from '../components/Home/ServicesSection';
import PortfolioSection from '../components/Home/PortfolioSection';
import ReviewsSection from '../components/Home/ReviewsSection';
import BlogSection from '../components/Home/BlogSection';
import FAQ from '../components/Utils/FAQ';
import Contact from '../components/Utils/Contact';

export default function Home() {
  return (
    <div className="pt-20 bg-bg-dark">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Ticker */}
      <Ticker />

      {/* 3. Services */}
      <ServicesSection />

      {/* 4. Projects */}
      <PortfolioSection />

      {/* 5. Reviews */}
      <ReviewsSection />

      {/* 6. Blog */}
      <BlogSection />

      {/* 7. FAQ */}
      <FAQ labelIndex="05" />

      {/* 8. Contact */}
      <Contact />
    </div>
  );
}
