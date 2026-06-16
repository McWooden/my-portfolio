"use client";
import React, { useState, useEffect } from 'react';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';
import ReviewsDesktopMarquee from './ReviewsDesktopMarquee';
import ReviewsMobileCarousel from './ReviewsMobileCarousel';

export default function ReviewsSection({ reviews }) {
  const [isDesktop, setIsDesktop] = useState(false);

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Section id="reviews">
      <SectionHeader
        index="03"
        tag="What they said"
        name="Reviews"
        title="Trusted Once — And Trusted Again By Ambitious Teams"
        subtitle="Feedback from clients"
      />

      <div className="w-full">
        {isDesktop ? (
          <ReviewsDesktopMarquee reviews={reviews} />
        ) : (
          <ReviewsMobileCarousel reviews={reviews} />
        )}
      </div>
    </Section>
  );
}
