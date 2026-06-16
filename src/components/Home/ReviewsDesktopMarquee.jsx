"use client";
import React, { useState, useEffect, useRef } from 'react';
import { reviews as staticReviews } from '../../data/siteData';
import ReviewCard from '../Utils/ReviewCard';

export default function ReviewsDesktopMarquee({ reviews = staticReviews }) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollOffsetRef = useRef(0);
  const trackRef = useRef(null);
  const scrollWidthRef = useRef(0);
  const speedChangeTimeRef = useRef(null);
  const speedChangeDirectionRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Visibility state to pause animations when off-screen
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Animation frame loop for Desktop infinite scroller
  useEffect(() => {
    if (!isVisible) return;

    let animationFrameId;
    const baseSpeed = 1.0; // base pixels per frame

    const tick = (time) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const dt = (time - lastTimeRef.current) / 16.666;
      lastTimeRef.current = time;

      if (trackRef.current) {
        // Cache scrollWidth to avoid Layout Thrashing (forced synchronous layout reflows)
        if (scrollWidthRef.current === 0) {
          scrollWidthRef.current = trackRef.current.scrollWidth;
        }
        
        const totalWidth = scrollWidthRef.current;
        const oneSetWidth = totalWidth / 3;

        if (!isHovered && oneSetWidth > 0) {
          // Calculate dynamic speed multiplier with ease-in-out curve
          let currentSpeedMultiplier = 1;
          if (speedChangeTimeRef.current !== null) {
            const elapsed = Date.now() - speedChangeTimeRef.current;
            if (elapsed >= 1000) {
              speedChangeTimeRef.current = null;
              speedChangeDirectionRef.current = null;
            } else {
              const x = elapsed / 1000;
              const curve = Math.sin(x * Math.PI); // Ease-in-out sine wave
              const peakMultiplier = speedChangeDirectionRef.current === 'forward' ? 5 : -5;
              currentSpeedMultiplier = 1 + (peakMultiplier - 1) * curve;
            }
          }

          const currentSpeed = baseSpeed * currentSpeedMultiplier;
          scrollOffsetRef.current = (scrollOffsetRef.current + currentSpeed * dt) % oneSetWidth;
          if (scrollOffsetRef.current < 0) {
            scrollOffsetRef.current += oneSetWidth;
          }
          trackRef.current.style.transform = `translate3d(-${scrollOffsetRef.current}px, 0, 0)`;
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTimeRef.current = null;
    };
  }, [isHovered, isVisible]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      scrollWidthRef.current = 0; // Reset cache to force re-measurement on resize
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop speed change trigger
  const triggerSpeedChange = (direction) => {
    speedChangeTimeRef.current = Date.now();
    speedChangeDirectionRef.current = direction;
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden mt-16 py-4 select-none">
      {/* Left Edge Hotspot (Rewind) */}
      <div
        onClick={() => triggerSpeedChange('backward')}
        className="absolute left-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/30 to-transparent transition-all select-none duration-200"
      />

      {/* Right Edge Hotspot (Fast Forward) */}
      <div
        onClick={() => triggerSpeedChange('forward')}
        className="absolute right-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer bg-gradient-to-l from-[#1a1a1a] via-[#1a1a1a]/30 to-transparent transition-all select-none duration-200"
      />

      {/* Ticker Track */}
      <div
        ref={trackRef}
        className="flex gap-[32px] w-max py-4"
        style={{ willChange: 'transform' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Triplicated sets for perfect seamless looping */}
        {reviews.map((review, i) => (
          <ReviewCard key={`r1-${i}`} review={review} className="" />
        ))}
        {reviews.map((review, i) => (
          <ReviewCard key={`r2-${i}`} review={review} className="" />
        ))}
        {reviews.map((review, i) => (
          <ReviewCard key={`r3-${i}`} review={review} className="" />
        ))}
      </div>
    </div>
  );
}
