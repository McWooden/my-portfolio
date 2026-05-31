import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Utils/Button';

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

  return (
    <section
      id="hero"
      className="pt-[100px] pb-[70px] px-5 xl:pt-[120px] xl:pb-[90px] xl:px-10 flex flex-col xl:flex-row xl:items-stretch items-center max-w-[1600px] mx-auto gap-[60px]"
    >
      {/* Content */}
      <div ref={contentRef} className="flex flex-col items-center text-center xl:items-start xl:text-left xl:w-1/2 w-full justify-center">
        <span className="font-mono text-[1rem] tracking-[-0.02em] text-text-primary uppercase mb-5">
          Graphic Designer
        </span>
        <h1 className="max-w-[600px] text-[3rem] md:text-[4.8rem] font-medium leading-[1.05] tracking-[-0.04em] text-white mb-6">
          I Design Brands You Can't Ignore
        </h1>
        <p className="text-[1.25rem] text-text-secondary leading-[1.4] mb-10 max-w-[480px]">
          Visual identity, layout, and design systems — for brands that want to stand out and stay consistent
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
            <span className="font-mono text-[0.95rem] text-text-primary uppercase">50+ reviews</span>
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
        className="w-full xl:w-1/2 relative rounded-[30px] overflow-visible bg-bg-card border border-border"
      >
        <img
          src="https://framerusercontent.com/images/XHEChVekS6RzYRttHyDfrU.png?width=1536&height=768"
          alt="Onyx Skincare"
          className="w-full h-full object-cover rounded-[30px]"
        />

        {/* Floating testimonial card */}
        <Link
          to="/portfolio/onyx-skincare"
          className="absolute top-[30px] left-5 bg-white text-bg-dark p-5 rounded-[24px] w-[280px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-4 z-[5] animate-float"
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
          <div className="absolute right-5 bottom-5 text-bg-dark">
            <svg viewBox="0 0 36 36" className="w-6 h-6">
              <path d="M10 26 L24 12 M24 12 L14 12 M24 12 L24 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </Link>

        {/* Floating slots badge */}
        <div className="absolute bottom-5 right-5 bg-bg-dark/85 backdrop-blur-[8px] border border-border px-6 py-3 rounded-[20px] flex items-center gap-[10px] z-[5] animate-float-delayed">
          <span className="pulse-dot"></span>
          <span className="font-mono text-[0.95rem] font-medium uppercase text-text-primary tracking-[-0.02em]">
            3 Open slots
          </span>
        </div>
      </div>
    </section>
  );
}
