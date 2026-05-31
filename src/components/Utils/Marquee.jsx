import React from 'react';

/**
 * Reusable Marquee (Infinite Scroll) Component
 * Wraps children and duplicate them for a seamless walking animation loop.
 */
export default function Marquee({ children, gapClass = "gap-20", className = "" }) {
  return (
    <div className={`w-full max-w-[1600px] mx-auto mask-ticker overflow-hidden ${className}`}>
      <div className={`flex w-max animate-ticker ${gapClass}`}>
        {/* Render primary list of items */}
        {children}
        {/* Duplicate list of items to create infinite scroll effect */}
        {children}
      </div>
    </div>
  );
}
