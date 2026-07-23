"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ExpandableImages from './ExpandableImages';

export default function HeroVisual({ contentHeight, homepageData, testimonialCard, mousePos = { x: 0, y: 0 } }) {
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

  // Testimonial values
  const quote = testimonialCard?.quote || "They captured our brand's personality instantly. Clients love the new look";
  const author = testimonialCard?.author || "Alina";
  const company = testimonialCard?.company || "Onyx Skincare";
  const slug = testimonialCard?.slug || "onyx-skincare";
  const avatarUrl = testimonialCard?.coverImage || "https://framerusercontent.com/images/v4L6r5bO1P0gFP6z0HYvFxRmcYw.png?scale-down-to=512&width=1024&height=1024";

  // Availability status values
  const status = homepageData?.status || 'available';
  const openSlots = homepageData?.openSlots ?? 2;
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

  let statusText = '2 Open slots';
  if (status === 'available') {
    statusText = `${openSlots} Open slot${openSlots !== 1 ? 's' : ''}`;
  } else if (status === 'working') {
    statusText = 'Working on projects';
  } else if (status === 'busy') {
    statusText = 'Busy';
  } else if (status === 'holiday') {
    statusText = 'On holiday';
  }

  return (
    <div 
      style={{
        ...(contentHeight ? { height: `${contentHeight}px` } : {}),
        transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 18}px, 60px) rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 8}deg) rotateZ(-1deg)`,
        transformStyle: 'preserve-3d',
        transition: isDragging ? 'none' : 'transform 500ms ease-out'
      }}
      className="w-full h-full min-h-[220px] relative transition-all"
    >
      {/* Background artwork panel with border and rounded corner clipping */}
      <div className="w-full h-full relative rounded-[30px] overflow-hidden bg-bg-card">
        <ExpandableImages />
      </div>

      {/* Floating testimonial card */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          transform: `translate3d(calc(${dragOffset.x}px + ${mousePos.x * 20}px), calc(${dragOffset.y}px + ${mousePos.y * 16}px), 75px) rotateY(${mousePos.x * 4}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        className="absolute top-4 left-4 bg-white text-neutral-900 p-4 rounded-[22px] w-[230px] sm:w-[250px] flex flex-col gap-3 z-30 select-none shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
      >
        {/* Top Row: Quote text + Circular top-right arrow button */}
        <div className="flex items-start justify-between gap-2.5">
          <p className="font-sans text-[0.8125rem] leading-[1.35] text-neutral-800 font-normal">
            {quote}
          </p>
          <Link 
            href={`/portfolio/${slug}`}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </Link>
        </div>

        {/* Bottom Row: Avatar + Single-line Muted Subtitle */}
        <div className="flex items-center gap-2 pt-0.5">
          <img
            src={avatarUrl}
            alt={author}
            className="w-6 h-6 rounded-full object-cover shrink-0"
          />
          <span className="text-[0.75rem] text-[#888888] font-normal truncate">
            {author}, {company}
          </span>
        </div>
      </div>
    </div>
  );
}
