"use client";
import React, { useState, useEffect, useRef } from 'react';
import Button from '../Utils/Button';
import HeroVisual from './HeroVisual';
import Ticker from '../Utils/Ticker';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

function CursorCard({ triggerText, children, imageSrc }) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e) => {
    const cardWidth = 200;
    const padding = 12;
    const targetX = e.clientX - cardWidth / 2;
    const clampedX = Math.max(padding, Math.min(targetX, window.innerWidth - cardWidth - padding));
    x.set(clampedX);
    y.set(e.clientY + 20);  // Slight vertical offset below cursor
  };

  return (
    <>
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        className="underline decoration-accent/50 hover:decoration-accent decoration-2 underline-offset-[6px] cursor-pointer text-white font-medium transition-all duration-200"
      >
        {triggerText}
      </span>
      
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                x: springX,
                y: springY,
                pointerEvents: 'none',
                zIndex: 10000,
              }}
              className="w-[200px] block bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden p-3 shadow-2xl text-left"
            >
              {imageSrc && (
                <img 
                  src={imageSrc} 
                  alt={triggerText} 
                  className="w-full h-[110px] object-cover rounded-xl mb-2.5 pointer-events-none"
                />
              )}
              <span className="block px-0.5">
                {children}
              </span>
            </motion.span>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default function Hero({ homepageData, testimonialCard }) {
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(null);
  const visualRef = useRef(null);
  const [rightMousePos, setRightMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.documentElement.classList.add('home-page');
    return () => {
      document.documentElement.classList.remove('home-page');
    };
  }, []);

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



  const rightMouseRef = useRef({ x: 0, y: 0 });
  const rightRafRef = useRef(null);

  useEffect(() => {
    const updateRightState = () => {
      setRightMousePos({
        x: rightMouseRef.current.x,
        y: rightMouseRef.current.y
      });
      rightRafRef.current = null;
    };

    const handleMouseMove = (e) => {
      if (!visualRef.current) return;
      const rect = visualRef.current.getBoundingClientRect();
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const dx = (x - xc) / xc;
      const dy = (y - yc) / yc;
      
      rightMouseRef.current = {
        x: Math.max(-1.5, Math.min(1.5, dx)),
        y: Math.max(-1.5, Math.min(1.5, dy))
      };

      if (!rightRafRef.current) {
        rightRafRef.current = requestAnimationFrame(updateRightState);
      }
    };

    const handleMouseLeave = () => {
      if (rightRafRef.current) {
        cancelAnimationFrame(rightRafRef.current);
        rightRafRef.current = null;
      }
      rightMouseRef.current = { x: 0, y: 0 };
      setRightMousePos({ x: 0, y: 0 });
    };

    const el = visualRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (rightRafRef.current) {
        cancelAnimationFrame(rightRafRef.current);
      }
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
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
    <>
      <section
        ref={containerRef}
        id="hero"
        className="perspective-3d-room pt-[80px] pb-6 px-5 xl:pt-[90px] xl:pb-8 xl:px-10 max-w-[1600px] mx-auto relative overflow-visible min-h-[80vh] flex items-center"
      >
        <div className="room-stage flex flex-col items-center gap-[40px] w-full relative z-10">
          {/* Headline Panel Wrapper (Aligned to the right) - temporarily hidden
          <div className="w-full flex justify-end text-right relative z-10">
            <h1 className="max-w-[720px] text-[clamp(2.8rem,12vw,3.6rem)] sm:text-[3.6rem] md:text-[4.4rem] lg:text-[4.6rem] font-medium leading-[1.45] tracking-[-0.04em] text-white mb-5 text-right">
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
                <div className="absolute inset-0 border-2 border-white rounded-[inherit] pointer-events-none z-10" />
              </span>{" "}
              <br />
              Coder Who{" "}
              <br />
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
                <div className="absolute inset-0 border-2 border-white rounded-[inherit] pointer-events-none z-10" />
              </span>{" "}
              Designs
            </h1>
          </div>
          */}

          {/* Description & Buttons Panel (Left-aligned) */}
          <div ref={contentRef} className="w-full flex flex-col items-center md:items-start text-center md:text-left mt-8">
            <p className="text-[1rem] sm:text-[1.15rem] text-text-secondary leading-[1.6] mb-8 w-full max-w-[300px] sm:max-w-[340px]">
              <CursorCard 
                triggerText="Huddin" 
                imageSrc="/images/huddin.webp"
              >
                <span className="flex flex-col gap-0.5 text-left">
                  <span className="font-mono text-[0.8rem] font-bold text-white uppercase tracking-wider">Sholahuddin Ahmad</span>
                  <span className="text-[0.7rem] text-text-secondary font-medium">Full-Stack Coder & Designer</span>
                  <span className="text-[0.65rem] text-text-muted leading-snug mt-1">
                    Building premium web applications with clean code and visual systems.
                  </span>
                </span>
              </CursorCard> is a{" "}
              <CursorCard 
                triggerText="Magelang" 
                imageSrc="/images/magelang.webp"
              >
                <span className="flex flex-col gap-0.5 text-left">
                  <span className="font-mono text-[0.8rem] font-bold text-white uppercase tracking-wider">Magelang</span>
                  <span className="text-[0.7rem] text-text-secondary font-medium">Central Java, ID</span>
                  <span className="text-[0.65rem] text-text-muted leading-snug mt-1">
                    Home of Candi Borobudur and surrounded by beautiful volcanic peaks.
                  </span>
                </span>
              </CursorCard>{" "}
              programmer, known for clean and expressive code — who also designs the brand
            </p>

            <div className="flex gap-4 w-full justify-center md:justify-start">
              <a 
                href="#contact" 
                className="group bg-accent text-bg-dark text-[1.05rem] font-semibold pl-7 pr-3 py-3 rounded-full flex items-center justify-center whitespace-nowrap select-none hover:bg-accent/90 transition-all duration-200"
              >
                Get started
                <span className="w-9 h-9 rounded-full bg-bg-dark text-accent flex items-center justify-center ml-4 shrink-0 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45">
                    <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
              <a 
                href="#portfolio" 
                className="bg-bg-card text-text-primary text-[1.05rem] font-medium px-7 py-[14px] rounded-full select-none text-center flex items-center justify-center whitespace-nowrap"
              >
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Images Section (Full-width after Hero) */}
      <section className="px-5 xl:px-10 max-w-[1600px] mx-auto mt-16 relative z-10">
        <div ref={visualRef} className="w-full flex justify-center">
          <div className="w-full max-w-[1000px] relative flex justify-center items-center">
            <HeroVisual 
              contentHeight={null} 
              homepageData={homepageData} 
              testimonialCard={testimonialCard} 
              mousePos={rightMousePos}
            />
          </div>
        </div>
      </section>

      <div className="relative z-10 mt-16 xl:mt-24 w-full">
        <Ticker />
      </div>
    </>
  );
}
