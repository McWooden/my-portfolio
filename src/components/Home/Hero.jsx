"use client";
import React, { useState, useEffect, useRef } from 'react';
import Button from '../Utils/Button';
import HeroVisual from './HeroVisual';
import Ticker from '../Utils/Ticker';
import Marquee from '../Utils/Marquee';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { SiSololearn } from 'react-icons/si';
import { LiaFreeCodeCamp } from 'react-icons/lia';
import { HiMiniCodeBracket } from 'react-icons/hi2';

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
  const [viewportHeight, setViewportHeight] = useState(null);
  const visualRef = useRef(null);
  const [rightMousePos, setRightMousePos] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mobileVideoState, setMobileVideoState] = useState('image'); // 'image' | 'playing'
  const [isScrolledFromTop, setIsScrolledFromTop] = useState(false);

  const triggerCloseTransition = () => {
    const video = videoRef.current;
    setMobileVideoState('image');
    
    // Wait for the 500ms CSS transition-opacity to finish before pausing/resetting
    setTimeout(() => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }, 500);
  };

  const handleHeroClickMobile = (e) => {
    if (!isMobileDevice) return;

    // Skip interactive elements like buttons, cards, chatbots
    const isInteractive = e.target.closest('button, a, input, textarea, [role="button"]');
    if (isInteractive) return;

    const video = videoRef.current;
    if (!video) return;

    if (mobileVideoState === 'image') {
      setMobileVideoState('playing');
      video.currentTime = 0;
      video.play().catch(() => {});
    } else if (mobileVideoState === 'playing') {
      triggerCloseTransition();
    }
  };

  const handleVideoEnded = () => {
    if (isMobileDevice) {
      triggerCloseTransition();
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    };

    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    setViewportHeight(window.innerHeight);
    setIsMobileDevice(checkMobile());

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const isMobile = checkMobile();
      setIsMobileDevice(isMobile);

      if (isMobile) {
        if (currentWidth !== lastWidth) {
          setViewportHeight(currentHeight);
          lastWidth = currentWidth;
          lastHeight = currentHeight;
        }
      } else {
        setViewportHeight(currentHeight);
        lastWidth = currentWidth;
        lastHeight = currentHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMobileDevice) {
      video.loop = false;
      video.pause();
    } else {
      video.pause();
    }
  }, [isMobileDevice]);

  // Scroll animations and scrubbing setup
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 5) {
      setIsScrolledFromTop(true);
    } else {
      setIsScrolledFromTop(false);
    }
  });

  // Scroll scrubbing for background video
  const scrollProgress = useTransform(scrollY, [0, 800], [0, 1]);
  const springProgress = useSpring(scrollProgress, { stiffness: 45, damping: 15 });

  useMotionValueEvent(springProgress, "change", (progress) => {
    if (isMobileDevice) return;
    
    const video = videoRef.current;
    if (video) {
      const duration = video.duration || 10;
      const targetTime = Math.min(Math.max(progress, 0), 1) * duration;
      if (video.readyState >= 2) {
        video.currentTime = targetTime;
      }
    }
  });


  // Background parallax motion values
  const bgX = useMotionValue(0);
  const bgY = useMotionValue(0);
  const springBgX = useSpring(bgX, { stiffness: 300, damping: 30 });
  const springBgY = useSpring(bgY, { stiffness: 300, damping: 30 });

  // Scroll animations for background image (bright initially, darkens on scroll)
  const opacityVal = useTransform(scrollY, [0, 500], [0.95, 0.3]);
  const filterVal = useTransform(scrollY, [0, 500], ["brightness(1.05) saturate(1.0)", "brightness(0.3) saturate(0.8)"]);

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

  useEffect(() => {
    const handleBgMouseMove = (e) => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Check if mouse is within the bounding rect of the hero container
      // (This includes the navbar region since the navbar overlays the top of the hero container)
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      if (isInside) {
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const dx = (x - xc) / xc;
        const dy = (y - yc) / yc;
        
        // Reverse displacement (reverse parallax)
        bgX.set(Math.max(-1.5, Math.min(1.5, dx)) * -65);
        bgY.set(Math.max(-1.5, Math.min(1.5, dy)) * -40);
      } else {
        bgX.set(0);
        bgY.set(0);
      }
    };

    const handleBgMouseLeave = () => {
      bgX.set(0);
      bgY.set(0);
    };

    window.addEventListener('mousemove', handleBgMouseMove);
    document.addEventListener('mouseleave', handleBgMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleBgMouseMove);
      document.removeEventListener('mouseleave', handleBgMouseLeave);
    };
  }, [bgX, bgY]);




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
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          scrollbar-width: none !important;
        }
        ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}} />
      <section
        ref={containerRef}
        id="hero"
        onClick={handleHeroClickMobile}
        style={viewportHeight ? { height: `${viewportHeight}px` } : {}}
        className="perspective-3d-room w-full h-[100svh] min-h-[500px] md:min-h-[600px] relative overflow-hidden bg-bg-dark flex items-end pb-0 md:items-stretch cursor-pointer md:cursor-default"
      >
        {/* Full-screen Background with premium blend gradients */}
        <div className="absolute top-0 left-0 w-full h-[75%] md:h-full z-0 overflow-hidden pointer-events-none">
          {/* Static WebP Background Image (visible on mobile, and as fallback behind video) */}
          <motion.img 
            src="/hero-bg.webp"
            alt="Hero Background Static"
            className="absolute inset-0 w-full h-full object-cover object-center md:object-left transition-opacity duration-500"
            style={{
              x: springBgX,
              y: springBgY,
              scale: 1.12,
              opacity: isMobileDevice 
                ? (mobileVideoState === 'playing' ? 0 : opacityVal)
                : (isScrolledFromTop ? 0 : opacityVal),
              filter: filterVal,
            }}
          />

          {/* WebM Video Background on top of image */}
          <motion.video 
            ref={videoRef}
            src="/hero-bg.webm" 
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover object-center md:object-left transition-opacity duration-500"
            style={{
              x: springBgX,
              y: springBgY,
              scale: 1.12,
              opacity: isMobileDevice 
                ? (mobileVideoState === 'playing' ? opacityVal : 0)
                : (isScrolledFromTop ? opacityVal : 0),
              filter: filterVal,
            }}
          />



          {/* Subtle vertical and horizontal gradient overlays to blend text readability with dark theme */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/90 via-bg-dark/30 to-transparent z-20" />
        </div>

        <div className="w-full h-full max-w-[1600px] mx-auto px-5 xl:px-10 relative z-10">
          <div className="room-stage w-full h-full relative z-10 flex flex-col pt-[70px] md:pt-[110px] pb-6 md:pb-6">
            <div 
              ref={contentRef} 
              className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8 mt-auto md:flex-1 md:py-6"
            >
              <div className="w-full max-w-[340px] order-2 md:order-1">
                <p className="text-[0.95rem] sm:text-[1.05rem] text-text-secondary leading-[1.6] w-full">
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
              </div>

              <div className={`shrink-0 select-none relative overflow-hidden ${
                isMobileDevice 
                  ? "w-[112px] h-[141px] order-1 self-end" 
                  : "w-[140px] h-[176px] order-2 self-auto"
              }`}>
                <iframe 
                  data-testid="embed-iframe" 
                  style={{ 
                    borderRadius: "12px",
                    transform: isMobileDevice ? "scale(0.4)" : "scale(0.5)",
                    transformOrigin: "top left",
                    width: "280px",
                    height: "352px",
                    border: 0
                  }} 
                  src="https://open.spotify.com/embed/track/0fBEsqcT3oMfhEGtJxEZxK?utm_source=generator&theme=0&si=dc61b0ff8126424b" 
                  frameBorder="0" 
                  allowFullScreen="" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            {/* Bottom Row Panel (Trusted by on the left, Buttons on the right) */}
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-end gap-6 mt-6 md:mt-0">
              
              {/* Left Side: Trusted By Marquee (35% width on desktop, bottom order on mobile) */}
              <div className="flex items-center gap-4 w-full md:w-[35vw] max-w-full overflow-hidden order-2 md:order-1">
                <span className="font-mono text-[0.7rem] font-bold text-text-muted uppercase tracking-wider shrink-0 select-none">
                  Trusted by:
                </span>
                <Marquee gapClass="gap-10" className="w-full">
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-1.5 select-none opacity-50 hover:opacity-100 hover:text-accent transition-all duration-300">
                      <LiaFreeCodeCamp className="w-5 h-5 text-current translate-y-[0.5px]" />
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-current leading-none">freeCodeCamp</span>
                    </div>
                    <div className="flex items-center gap-1.5 select-none opacity-50 hover:opacity-100 hover:text-accent transition-all duration-300">
                      <SiSololearn className="w-4 h-4 text-current translate-y-[0.5px]" />
                      <span className="font-sans font-bold text-xs uppercase tracking-widest text-current leading-none">Sololearn</span>
                    </div>
                    <div className="flex items-center gap-1.5 select-none opacity-50 hover:opacity-100 hover:text-accent transition-all duration-300">
                      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-none stroke-current translate-y-[0.5px]" strokeWidth="2.5">
                        <rect x="4" y="4" width="16" height="16" rx="4" />
                        <path d="M9 10l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-sans font-black text-xs uppercase tracking-wider text-current leading-none">Mimo</span>
                    </div>
                    <div className="flex items-center gap-1.5 select-none opacity-50 hover:opacity-100 hover:text-accent transition-all duration-300">
                      <HiMiniCodeBracket className="w-4.5 h-4.5 text-current translate-y-[0.5px]" />
                      <span className="font-sans font-bold text-xs uppercase tracking-widest text-current leading-none">Dicoding</span>
                    </div>
                    <div className="flex items-center gap-1.5 select-none opacity-50 hover:opacity-100 hover:text-accent transition-all duration-300">
                      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-none stroke-current translate-y-[0.5px]" strokeWidth="2.5">
                        <path d="M8 6H4v12h4M16 6h4v12h-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-mono font-extrabold text-xs uppercase tracking-tight text-current leading-none">CODEPOLITAN</span>
                    </div>
                  </div>
                </Marquee>
              </div>

              {/* Right Side: Buttons (flex row side-by-side, Get Started stretches to fill) */}
              <div className="flex flex-row gap-4 shrink-0 justify-center md:justify-end items-center md:items-end w-full md:w-auto order-1 md:order-2">
                <a 
                  href="#portfolio" 
                  className="bg-bg-card text-text-primary text-[1.05rem] font-medium px-7 py-[14px] rounded-full select-none text-center flex items-center justify-center whitespace-nowrap"
                >
                  Portfolio
                </a>
                <a 
                  href="#contact" 
                  className="flex-1 md:flex-none group bg-accent text-bg-dark text-[1.05rem] font-semibold pl-7 pr-3 py-3 rounded-full flex items-center justify-center whitespace-nowrap select-none hover:bg-accent/90 transition-all duration-200"
                >
                  Get started
                  <span className="w-9 h-9 rounded-full bg-bg-dark text-accent flex items-center justify-center ml-4 shrink-0 shadow-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45">
                      <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </div>

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
