import React from 'react';

/**
 * Reusable Marquee (Infinite Scroll) Component
 * Wraps children and duplicate them for a seamless walking animation loop.
 */
export default function Marquee({ children, gapClass = "gap-20", className = "" }) {
  return (
    <div className={`w-full max-w-[1600px] mx-auto overflow-hidden relative ${className}`}>
      {/* GPU-accelerated absolute gradient overlays for side fading */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg-dark to-transparent z-10 pointer-events-none" />

      <div className={`flex w-max animate-ticker ${gapClass}`}>
        {/* Render primary list of items */}
        {children}
        {/* Duplicate list of items to create infinite scroll effect */}
        {children}
      </div>
    </div>
  );
}
