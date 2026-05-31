import React, { useState, useEffect, useRef } from 'react';
import { reviews } from '../../data/siteData';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';
import ReviewCard from '../Utils/ReviewCard';

export default function ReviewsSection() {
  const [isDesktop, setIsDesktop] = useState(false);

  // Mobile Stories slider state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const duration = 5000; // 5 seconds per slide
  const progressRef = useRef(0);
  const lastTimeRef = useRef(null);
  const pressStartTimeRef = useRef(0);
  const progressBarsRef = useRef([]);

  // Desktop scroller state
  const [isHovered, setIsHovered] = useState(false);
  const scrollOffsetRef = useRef(0);
  const trackRef = useRef(null);
  const scrollWidthRef = useRef(0);
  const speedChangeTimeRef = useRef(null);
  const speedChangeDirectionRef = useRef(null);

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      scrollWidthRef.current = 0; // Reset cache to force re-measurement on resize
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation frame loop for Mobile stories slider
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

  // Sync widths on index or view change
  useEffect(() => {
    if (!isDesktop) {
      updateProgressBarWidths(currentIndex);
    }
  }, [currentIndex, isDesktop]);

  useEffect(() => {
    if (isDesktop) return;

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
        
        // Directly update active progress bar width to prevent layout re-render thrashing
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
  }, [isPaused, currentIndex, isDesktop]);

  // Animation frame loop for Desktop infinite scroller
  useEffect(() => {
    if (!isDesktop) return;

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
          trackRef.current.style.transform = `translateX(-${scrollOffsetRef.current}px)`;
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTimeRef.current = null;
    };
  }, [isDesktop, isHovered]);

  // Mobile Navigation handlers
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

  // Desktop speed change trigger
  const triggerSpeedChange = (direction) => {
    speedChangeTimeRef.current = Date.now();
    speedChangeDirectionRef.current = direction;
  };

  return (
    <Section id="reviews">
      <SectionHeader
        index="03"
        tag="What they said"
        name="Reviews"
        title="Trusted Once — And Trusted Again By Ambitious Teams"
        subtitle="Feedback from clients"
      />

      {isDesktop ? (
        /* LAPTOP/DESKTOP VIEW: Infinite Scrolling Marquee with Edge Controls */
        <div className="relative w-full overflow-hidden mask-ticker mt-16 py-4 select-none">
          
          {/* Left Edge Hotspot (Rewind) */}
          <div
            onClick={() => triggerSpeedChange('backward')}
            className="absolute left-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/30 to-transparent transition-all select-none active:scale-95 duration-200"
          />

          {/* Right Edge Hotspot (Fast Forward) */}
          <div
            onClick={() => triggerSpeedChange('forward')}
            className="absolute right-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer bg-gradient-to-l from-[#1a1a1a] via-[#1a1a1a]/30 to-transparent transition-all select-none active:scale-95 duration-200"
          />

          {/* Ticker Track */}
          <div
            ref={trackRef}
            className="flex gap-[32px] w-max py-4"
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
      ) : (
        /* MOBILE VIEW: Instagram Stories-style Carousel Card */
        <div className="flex flex-col items-center justify-center mt-16 w-full">
          {/* Stories Progress Indicators */}
          <div className="flex gap-2.5 w-[360px] max-w-full mb-8 px-2">
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
            className="relative w-[360px] h-[360px] rounded-[30px] overflow-hidden select-none cursor-pointer group"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
          >
            {/* Card Slider with Gap */}
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * (360 + 24)}px)` }}
            >
              {reviews.map((review, i) => (
                <div key={i} className="w-[360px] h-full shrink-0 mr-[24px]">
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
      )}
    </Section>
  );
}


