import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Utils/Button';
import ScratchCanvas from './ScratchCanvas';

export default function Hero() {
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

  // Drag state for visual panel's floating card
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [canFloat, setCanFloat] = useState(true);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e) => {
    // Only drag with left click or touch
    if (e.button !== undefined && e.button !== 0) return;
    
    // Prevent default browser text selection or link dragging
    e.preventDefault();
    
    setIsDragging(true);
    setCanFloat(false);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    // Delay float animation until snap-back transition completes (600ms)
    setTimeout(() => {
      setCanFloat(true);
    }, 600);
  };

  useEffect(() => {
    if (isDragging) {
      const onMove = (e) => {
        if (e.cancelable) e.preventDefault();
        handleDragMove(e);
      };
      const onEnd = () => handleDragEnd();

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);

      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
      };
    }
  }, [isDragging]);



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
      className="pt-[100px] pb-[70px] px-5 xl:pt-[120px] xl:pb-[90px] xl:px-10 flex flex-col xl:flex-row xl:items-stretch items-center max-w-[1600px] mx-auto gap-[60px]"
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

        <h1 className="max-w-[720px] text-[2.85rem] sm:text-[3.6rem] md:text-[4.6rem] lg:text-[4.8rem] font-medium leading-[1.45] tracking-[-0.04em] text-white mb-6">
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
                  <img src={img} className="w-full h-full object-cover pointer-events-none" alt="" />
                </div>
              ))}
            </div>
            {/* Inverted border overlay (White) */}
            <div className="absolute inset-0 border-2 border-white rounded-[inherit] pointer-events-none z-10" />
          </span>{" "}
          Coder <br className="hidden sm:inline" /> Who{" "}
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
        <p className="text-[0.95rem] sm:text-[1.25rem] text-text-secondary leading-[1.4] mb-10 w-[90%] sm:w-full max-w-[480px] line-clamp-2">
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
      <div 
        style={contentHeight ? { height: `${contentHeight}px` } : {}}
        className="w-full xl:w-1/2 relative rounded-[30px] overflow-visible bg-bg-card border-8 border-border -rotate-[1deg]"
      >
        <ScratchCanvas />

        {/* Floating testimonial card */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
            transition: isDragging ? 'none' : 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
          className="absolute top-[30px] left-5 bg-white text-bg-dark p-5 rounded-[24px] w-[280px] flex flex-col gap-4 z-30 select-none"
        >
          <p className="font-sans text-[0.95rem] leading-[1.4] text-[#1a1a1a] font-medium">
            "They captured our brand's personality instantly. Clients love the new look"
          </p>
          <div className="flex items-center gap-[10px]">
            <img
              src="https://framerusercontent.com/images/v4L6r5bO1P0gFP6z0HYvFxRmcYw.png?scale-down-to=512&width=1024&height=1024"
              alt="Alina"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-[0.9rem] text-text-muted font-medium">Alina, Onyx Skincare</span>
          </div>
          <Link 
            to="/portfolio/onyx-skincare"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute right-5 bottom-5 text-bg-dark hover:scale-110 transition-transform duration-200 cursor-pointer"
          >
            <svg viewBox="0 0 36 36" className="w-6 h-6">
              <path d="M10 26 L24 12 M24 12 L14 12 M24 12 L24 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </Link>
        </div>

        {/* Floating slots badge */}
        <div className="absolute bottom-5 right-5 bg-[#222222]/95 border border-border px-6 py-3 rounded-[20px] flex items-center gap-[10px] z-30">
          <span className="pulse-dot"></span>
          <span className="font-mono text-[0.95rem] font-medium uppercase text-text-primary tracking-[-0.02em]">
            3 Open slots
          </span>
        </div>
      </div>
    </section>
  );
}
