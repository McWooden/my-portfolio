"use client";
import React, { useState, useEffect, useRef } from 'react';
import Button from '../Utils/Button';
import HeroVisual from './HeroVisual';

export default function Hero({ homepageData, testimonialCard }) {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Set the height matching the content element
        setContentHeight(entry.target.offsetHeight);
      }
    });

    resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const marqueeImages = [
    'https://framerusercontent.com/images/0Y1cjcOdQp68PBw6G3HHfHz6TYo.jpg?width=400&height=300',
    'https://framerusercontent.com/images/jSslhcqo8HKNjUvPEceq7bhbY.jpg?width=400&height=300',
    'https://framerusercontent.com/images/tuaWaeYvMrVUFQ3zYlXxYRBz57c.png',
    'https://framerusercontent.com/images/bpPz4YMTN8BLoho6St2Rnoy8G7M.png'
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Duplicate the first image at the end to allow seamless vertical scrolling down
  const displayImages = [...marqueeImages, marqueeImages[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setSlideIndex((prev) => prev + 1);
    }, 3000); // Wait on each slide for 3 seconds
    return () => clearInterval(timer);
  }, []);

  const handleTransitionEnd = () => {
    if (slideIndex >= marqueeImages.length) {
      setIsTransitioning(false);
      setSlideIndex(0);
    }
  };




  const jobs = ["Full-Stack Developer", "UX Designer", "Freelancer", "Research", "Analysist", "Philosopher", "The Leader", "The Sage", "Hi!", "Hello!", "Welcome!"];
  const [jobIndex, setJobIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [speed, setSpeed] = useState(400);

  const rollJob = () => {
    if (isRolling) return;
    setIsRolling(true);

    // Randomize next target index (ensure it doesn't get stuck on the same one)
    let targetIndex;
    do {
      targetIndex = Math.floor(Math.random() * jobs.length);
    } while (targetIndex === jobIndex);

    const steps = 8;
    // Step delay durations (faster to slower)
    const delays = [80, 80, 100, 150, 220, 320, 480, 700];
    // Matching CSS transition durations for visual coherence
    const speeds = [80, 80, 100, 150, 220, 320, 480, 700];

    let currentStep = 0;
    let currentTempIndex = jobIndex;

    const tick = () => {
      currentStep++;
      currentTempIndex = (currentTempIndex + 1) % jobs.length;

      setSpeed(speeds[currentStep - 1] || 300);

      if (currentStep === steps) {
        setJobIndex(targetIndex);
        setIsRolling(false);
        return;
      }

      setJobIndex(currentTempIndex);
      setTimeout(tick, delays[currentStep - 1]);
    };

    setTimeout(tick, 80);
  };

  return (
    <section
      id="hero"
      className="pt-[100px] pb-8 px-5 xl:pt-[110px] xl:pb-12 xl:px-10 flex flex-col xl:flex-row xl:items-stretch items-center max-w-[1600px] mx-auto gap-[60px]"
    >
      {/* Content */}
      <div ref={contentRef} className="flex flex-col items-center text-center xl:items-start xl:text-left xl:w-1/2 w-full justify-center">

        {/* Interactive rolling job slot */}
        <button
          onClick={rollJob}
          disabled={isRolling}
          className="font-mono text-[1rem] tracking-[-0.02em] text-text-primary uppercase mb-5 select-none cursor-pointer flex flex-col items-center xl:items-start h-[1.5em] overflow-hidden group focus:outline-none disabled:cursor-default"
          title="Click to roll next job!"
        >
          <div
            className="transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center xl:items-start"
            style={{
              transform: `translateY(-${jobIndex * 1.5}em)`,
              transitionDuration: `${speed}ms`
            }}
          >
            {jobs.map((job) => (
              <span key={job} className="h-[1.5em] leading-[1.5em] block group-hover:text-accent transition-colors duration-200 relative">
                {job}
                <span className={`text-accent/60 text-[0.85em] ml-1 transition-all duration-200 absolute left-full top-0 ${isRolling ? 'animate-spin inline-block' : 'opacity-0 group-hover:opacity-100'}`}>
                  ⟳
                </span>
              </span>
            ))}
          </div>
        </button>

        <h1 className="max-w-[720px] text-[clamp(3rem,14vw,3.6rem)] sm:text-[3.6rem] md:text-[4.6rem] lg:text-[4.8rem] font-medium leading-[1.45] tracking-[-0.04em] text-white mb-6">
          I'm The{" "}
          <span
            className="inline-flex items-center justify-center mx-1 sm:mx-2 w-[2.2em] h-[1.15em] rounded-[24px] overflow-hidden bg-black select-none align-middle relative -rotate-2"
            style={{
              boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), 0 16px 24px rgba(0, 0, 0, 0.15), 0 24px 32px rgba(0, 0, 0, 0.09)'
            }}
          >
            <div
              className="absolute inset-0 flex flex-col"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateY(-${slideIndex * 100}%)`,
                transition: isTransitioning ? 'transform 600ms ease-in-out' : 'none'
              }}
            >
              {displayImages.map((img, idx) => (
                <div key={idx} className="w-full h-full shrink-0">
                  <img src={img} className="w-full h-full object-cover pointer-events-none" alt={`Huddin project showcase ${idx + 1}`} />
                </div>
              ))}
            </div>
            {/* Inverted border overlay (White) */}
            <div className="absolute inset-0 border-2 border-white rounded-[inherit] pointer-events-none z-10" />
          </span>{" "}
          <br className="md:hidden" />
          Coder{" "}
          <br className="hidden md:inline" />
          Who{" "}
          <br className="md:hidden" />
          <span
            className="inline-flex items-center justify-center mx-1 sm:mx-2 w-[1.9em] h-[1.15em] rounded-[24px] overflow-hidden bg-black select-none align-middle relative rotate-2"
            style={{
              boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), 0 16px 24px rgba(0, 0, 0, 0.15), 0 24px 32px rgba(0, 0, 0, 0.09)'
            }}
          >
            <img
              src="/assets/hero-loop.gif"
              className="w-full h-full object-cover pointer-events-none opacity-85"
              alt="Slow looping design animation"
            />
            {/* Inverted border overlay (White) */}
            <div className="absolute inset-0 border-2 border-white rounded-[inherit] pointer-events-none z-10" />
          </span>{" "}
          Designs
        </h1>
        <p className="text-[0.95rem] sm:text-[1.25rem] text-text-secondary leading-[1.4] mb-10 w-[90%] sm:w-full max-w-[480px]">
          Huddin is a Magelang programmer, known for clean and expressive code — who also designs the brand
        </p>

        {/* CTA buttons */}
        <div className="flex gap-4 w-full justify-center xl:justify-start mb-10">
          <Button href="#contact" variant="primary">
            Get started
          </Button>
          <Button href="#portfolio" variant="secondary">
            Portfolio
          </Button>
        </div>

        {/* Reviews badge */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 mr-2">
            {[
              'https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024',
              'https://framerusercontent.com/images/qMrMTWyggoctZktmN3xk9LziWM.png?width=1024&height=1024',
              'https://framerusercontent.com/images/LVcACvWfr9MemEEBhRIZ9Mj0A.png?width=1024&height=1024',
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Reviewer"
                className="w-9 h-9 rounded-full object-cover border-2 border-bg-dark first:ml-0"
              />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[0.95rem] text-text-primary uppercase">15+ networks</span>
            <div className="flex gap-[3px] text-accent">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual panel */}
      <HeroVisual contentHeight={contentHeight} homepageData={homepageData} testimonialCard={testimonialCard} />
    </section>
  );
}
