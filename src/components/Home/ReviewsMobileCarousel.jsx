"use client";
import React, { useState, useEffect, useRef } from 'react';
import { reviews as staticReviews } from '../../data/siteData';
import ReviewCard from '../Utils/ReviewCard';

export default function ReviewsMobileCarousel({ reviews = staticReviews }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const duration = 5000; // 5 seconds per slide
  const progressRef = useRef(0);
  const lastTimeRef = useRef(null);
  const pressStartTimeRef = useRef(0);
  const progressBarsRef = useRef([]);

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

  const updateProgressBarWidths = (targetIndex) => {
    reviews.forEach((_, i) => {
      if (progressBarsRef.current[i]) {
        if (i < targetIndex) {
          progressBarsRef.current[i].style.width = '100%';
        } else if (i > targetIndex) {
          progressBarsRef.current[i].style.width = '0%';
        }
      }
    });
  };

  useEffect(() => {
    updateProgressBarWidths(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (!isVisible) return;

    let animationFrameId;

    const tick = (time) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPaused) {
        progressRef.current += delta;
        const currentProgress = Math.min((progressRef.current / duration) * 100, 100);
        
        if (progressBarsRef.current[currentIndex]) {
          progressBarsRef.current[currentIndex].style.width = `${currentProgress}%`;
        }

        if (currentProgress >= 100) {
          const nextIndex = (currentIndex + 1) % reviews.length;
          updateProgressBarWidths(nextIndex);
          progressRef.current = 0;
          lastTimeRef.current = null;
          setCurrentIndex(nextIndex);
        }
      } else {
        lastTimeRef.current = time;
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTimeRef.current = null;
    };
  }, [isPaused, currentIndex, isVisible]);

  const handleNext = () => {
    const pressDuration = Date.now() - pressStartTimeRef.current;
    if (pressDuration > 250) return;

    const nextIndex = (currentIndex + 1) % reviews.length;
    updateProgressBarWidths(nextIndex);

    progressRef.current = 0;
    lastTimeRef.current = null;
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    const pressDuration = Date.now() - pressStartTimeRef.current;
    if (pressDuration > 250) return;

    const prevIndex = (currentIndex - 1 + reviews.length) % reviews.length;
    updateProgressBarWidths(prevIndex);

    progressRef.current = 0;
    lastTimeRef.current = null;
    setCurrentIndex(prevIndex);
  };

  const handlePressStart = () => {
    pressStartTimeRef.current = Date.now();
    setIsPaused(true);
  };

  const handlePressEnd = () => {
    setIsPaused(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center w-full px-4">
      {/* Stories Progress Indicators */}
      <div className="flex gap-2.5 w-full max-w-[360px] mb-8 px-2">
        {reviews.map((_, i) => {
          const initialWidth = i < currentIndex ? '100%' : '0%';
          return (
            <div key={i} className="h-1 bg-white/10 rounded-full flex-1 overflow-hidden">
              <div
                ref={(el) => (progressBarsRef.current[i] = el)}
                className="h-full bg-[#E0FF6F]"
                style={{
                  width: initialWidth,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Card Container */}
      <div
        className="relative w-full max-w-[360px] rounded-[30px] overflow-hidden select-none cursor-pointer group"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        {/* Card Slider */}
        <div
          className="flex gap-[24px] transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 24}px))` }}
        >
          {reviews.map((review, i) => (
            <div key={i} className="w-full shrink-0">
              <ReviewCard review={review} className="w-full h-full" />
            </div>
          ))}
        </div>

        {/* Left Navigation Hotspot (Left 30%) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[30%] z-20"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
        />

        {/* Right Navigation Hotspot (Right 70%) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[70%] z-20"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        />
      </div>
    </div>
  );
}
