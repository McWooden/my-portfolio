"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ExpandableImages from './ExpandableImages';

export default function HeroVisual({ contentHeight, homepageData, testimonialCard }) {
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
  const openSlots = homepageData?.openSlots ?? 3;

  let statusText = '3 Open slots';
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
      style={contentHeight ? { height: `${contentHeight}px` } : {}}
      className="w-full xl:w-1/2 relative rounded-[30px] overflow-visible bg-bg-card border-8 border-border -rotate-[1deg]"
    >
      <ExpandableImages />

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
        className="absolute top-[30px] left-5 bg-white text-bg-dark p-5 rounded-3xl w-[280px] flex flex-col gap-4 z-30 select-none"
      >
        <p className="font-sans text-[0.95rem] leading-[1.4] text-[#1a1a1a] font-medium">
          "{quote}"
        </p>
        <div className="flex items-center gap-[10px]">
          <img
            src={avatarUrl}
            alt={author}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-[0.9rem] text-text-muted font-medium">{author}, {company}</span>
        </div>
        <Link 
          href={`/portfolio/${slug}`}
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
        <span className={`pulse-dot status-${status}`}></span>
        <span className="font-mono text-[0.95rem] font-medium uppercase text-text-primary tracking-[-0.02em]">
          {statusText}
        </span>
      </div>
    </div>
  );
}
