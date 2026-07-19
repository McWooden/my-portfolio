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
import { IoPlay, IoPause } from 'react-icons/io5';

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

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const ytPlayerRef = useRef(null);
  const youtubeTooltipRef = useRef(null);
  
  const [showTrustedTooltip, setShowTrustedTooltip] = useState(false);
  const trustedTooltipRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (youtubeTooltipRef.current && !youtubeTooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
      if (trustedTooltipRef.current && !trustedTooltipRef.current.contains(event.target)) {
        setShowTrustedTooltip(false);
      }
    };

    if (showTooltip || showTrustedTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTooltip, showTrustedTooltip]);

  // Load YT Player script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Monitor time to stop exactly at 0:33
  useEffect(() => {
    let timer;
    if (isMusicPlaying) {
      timer = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          const time = ytPlayerRef.current.getCurrentTime();
          if (time >= 33) {
            ytPlayerRef.current.pauseVideo();
            ytPlayerRef.current.seekTo(0);
            setIsMusicPlaying(false);
          }
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isMusicPlaying]);

  const handleYoutubeTextClick = (e) => {
    e.stopPropagation(); // Avoid triggering Polaroid play toggle
    setShowTooltip(prev => !prev);
  };

  const handlePolaroidClick = () => {
    const initAndPlay = () => {
      if (window.YT && window.YT.Player) {
        ytPlayerRef.current = new window.YT.Player('youtube-music-player', {
          events: {
            'onReady': (event) => {
              if (event.target.setPlaybackQuality) {
                event.target.setPlaybackQuality('tiny');
              }
              event.target.unMute();
              event.target.playVideo();
              setIsMusicPlaying(true);
            },
            'onStateChange': (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsMusicPlaying(true);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsMusicPlaying(false);
                ytPlayerRef.current.seekTo(0);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsMusicPlaying(false);
              }
            }
          }
        });
      } else {
        console.warn("YouTube API is not loaded yet.");
      }
    };

    if (!ytPlayerRef.current || !ytPlayerRef.current.playVideo) {
      initAndPlay();
      return;
    }

    if (isMusicPlaying) {
      ytPlayerRef.current.pauseVideo();
      setIsMusicPlaying(false);
    } else {
      if (ytPlayerRef.current.setPlaybackQuality) {
        ytPlayerRef.current.setPlaybackQuality('tiny');
      }
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.playVideo();
      setIsMusicPlaying(true);
    }
  };

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
              className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8 mt-auto md:flex-1 md:py-6"
            >
              <div className="w-full max-w-[320px] order-2 md:order-1">
                <p className="text-[0.95rem] sm:text-[1.05rem] text-text-secondary leading-[1.6] w-full flex flex-wrap gap-y-1">
                  <motion.span
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.56, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "inline-block", marginRight: "0.25rem" }}
                  >
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
                    </CursorCard>
                  </motion.span>

                  <motion.span
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.56, delay: 0.228, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "inline-block", marginRight: "0.25rem" }}
                  >
                    is a
                  </motion.span>

                  <motion.span
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.56, delay: 0.256, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "inline-block", marginRight: "0.25rem" }}
                  >
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
                    </CursorCard>
                  </motion.span>

                  {"programmer, known for clean and expressive code — who also designs the brand"
                    .split(" ")
                    .map((word, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ 
                          duration: 0.56, 
                          delay: 0.284 + index * 0.028, 
                          ease: [0.22, 1, 0.36, 1] 
                        }}
                        style={{ display: "inline-block", marginRight: "0.25rem" }}
                      >
                        {word}
                      </motion.span>
                    ))}
                </p>
              </div>

              {/* Spotify embed commented out as requested */}
              {/*
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
              */}

              {/* YouTube Polaroid style embed */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  y: -50, 
                  scale: 0.8,
                  rotate: 6 
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotate: -3 
                }}
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 12,
                  delay: 0.6
                }}
                className={`shrink-0 select-none bg-white border border-neutral-200/80 rounded-[2px] shadow-[0_16px_32px_rgba(0,0,0,0.3),0_2px_6px_rgba(0,0,0,0.15)] flex flex-col gap-2 ${
                  isMobileDevice
                    ? "order-1 self-end p-1.5 pb-3 w-[110px]"
                    : "order-2 self-auto p-2.5 pb-4 w-[160px]"
                }`}
              >
                {/* Cover image — click to play/pause */}
                <div
                  onClick={handlePolaroidClick}
                  className="w-full aspect-square rounded-[1px] overflow-hidden bg-neutral-950 relative border border-neutral-300/40 cursor-pointer group/photo"
                >
                  <img
                    src="/struct.webp"
                    alt="STRUCT Cover"
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  />

                  {/* Hidden YouTube iframe — audio only */}
                  <iframe
                    id="youtube-music-player"
                    src="https://www.youtube.com/embed/LgMvaRwbEOE?enablejsapi=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                    className="absolute w-1 h-1 opacity-0 pointer-events-none"
                    style={{ border: 0 }}
                  />

                  {/* Hover overlay with play/pause */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-bg-card flex items-center justify-center shadow-lg text-text-primary">
                      {isMusicPlaying
                        ? <IoPause className="w-3.5 h-3.5 text-current" />
                        : <IoPlay className="w-3.5 h-3.5 text-current translate-x-[0.5px]" />
                      }
                    </div>
                  </div>

                  {/* Live playing pill */}
                  {isMusicPlaying && (
                    <div className="absolute top-1 right-1 bg-red-600/90 text-white text-[6.5px] font-bold tracking-wider px-1 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse select-none z-10">
                      <span className="w-0.5 h-0.5 bg-white rounded-full" />
                      PLAYING
                    </div>
                  )}
                </div>

                {/* Bottom label row (stacked vertically in 2 lines) */}
                <div className="bg-neutral-100 rounded-[3px] px-1.5 py-1 flex flex-col gap-1 w-full relative">
                  <div className="flex items-center gap-0.5 min-w-0">
                    <span className="text-[#333] text-[8px] md:text-[9px] font-bold select-none leading-none shrink-0">❇</span>
                    <span className="text-[#333] font-mono text-[7px] md:text-[8px] font-bold tracking-wider select-none leading-tight">
                      STRUCT by UDIENNX
                    </span>
                  </div>
                  
                  <div ref={youtubeTooltipRef} className="relative self-end">
                    <span
                      onClick={handleYoutubeTextClick}
                      className="text-neutral-500 font-sans text-[7px] md:text-[8px] font-bold tracking-wide select-none leading-none cursor-pointer block"
                    >
                      /Youtube
                    </span>
                    {showTooltip && (
                      <div className="absolute right-0 bottom-full mb-3 w-56 p-3 bg-bg-dark/95 backdrop-blur-md border border-border/10 rounded-xl shadow-2xl z-[1010] flex flex-col gap-2.5 origin-bottom-right text-left">
                        {/* Small arrow pointing down */}
                        <div className="absolute right-6 -bottom-1 w-2.5 h-2.5 bg-bg-dark border-b border-r border-border/10 rotate-45" />
                        
                        <p className="font-sans text-[0.75rem] text-text-secondary leading-relaxed">
                          Listen to this track on YouTube?
                        </p>
                        
                        <div className="flex gap-2 justify-end mt-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                            className="px-2.5 py-1 rounded-lg border border-border/10 text-[0.65rem] font-medium text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            Stay here
                          </button>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setShowTooltip(false); 
                              window.open("https://youtu.be/LgMvaRwbEOE?si=Oudd4EAkxaPRNTcN", "_blank"); 
                            }}
                            className="px-2.5 py-1 rounded-lg bg-accent text-[0.65rem] font-semibold text-bg-dark hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center"
                          >
                            Listen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row Panel (Trusted by on the left, Buttons on the right) */}
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-end gap-6 mt-6 md:mt-0">
              
              {/* Left Side: Trusted By Marquee (35% width on desktop, bottom order on mobile) */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
                className="flex items-center gap-4 w-full md:w-[35vw] max-w-full overflow-visible order-2 md:order-1"
              >
                <div ref={trustedTooltipRef} className="relative shrink-0 flex items-center">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTrustedTooltip(prev => !prev);
                    }}
                    className="font-mono text-[0.7rem] font-bold text-text-muted uppercase tracking-wider select-none cursor-pointer"
                  >
                    Trusted by:
                  </span>
                  {showTrustedTooltip && (
                    <div className="absolute left-0 bottom-full mb-3 w-60 p-3 bg-bg-dark/95 backdrop-blur-md border border-border/10 rounded-xl shadow-2xl z-[1010] flex flex-col gap-2.5 origin-bottom-left text-left">
                      {/* Small arrow pointing down */}
                      <div className="absolute left-6 -bottom-1 w-2.5 h-2.5 bg-bg-dark border-b border-r border-border/10 rotate-45" />
                      
                      <p className="font-sans text-[0.75rem] text-text-secondary leading-relaxed">
                        Verify 32+ qualifications and certifications on LinkedIn
                      </p>
                      
                      <div className="flex gap-2 justify-end mt-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowTrustedTooltip(false); }}
                          className="px-2.5 py-1 rounded-lg border border-border/10 text-[0.65rem] font-medium text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          Awesome
                        </button>
                        <a
                          href="https://www.linkedin.com/in/sholahuddin-ahmad/details/certifications/"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowTrustedTooltip(false)}
                          className="px-2.5 py-1 rounded-lg bg-accent text-[0.65rem] font-semibold text-bg-dark flex items-center justify-center cursor-pointer"
                        >
                          Show Me
                        </a>
                      </div>
                    </div>
                  )}
                </div>
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
              </motion.div>
 
              {/* Right Side: Buttons (flex row side-by-side, Get Started stretches to fill) */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                className="flex flex-row gap-4 shrink-0 justify-center md:justify-end items-center md:items-end w-full md:w-auto order-1 md:order-2"
              >
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
                  <span className="relative block h-[1.5rem] overflow-hidden text-left min-w-[95px]">
                    <span className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:-translate-y-full flex flex-col">
                      <span className="h-[1.5rem] flex items-center">Get started</span>
                      <span className="h-[1.5rem] flex items-center">Contact</span>
                    </span>
                    <span className="invisible h-[1.5rem] flex items-center">Get started</span>
                  </span>
                  <span className="w-9 h-9 rounded-full bg-bg-dark text-accent flex items-center justify-center ml-4 shrink-0 shadow-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45">
                      <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </motion.div>

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
