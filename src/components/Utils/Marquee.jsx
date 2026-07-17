import React, { useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';

/**
 * Reusable Draggable Marquee (Infinite Scroll) Component
 * Supports smooth auto-scroll, mouse/touch dragging, momentum physics,
 * and seamless infinite loop wrapping.
 */
export default function Marquee({ children, gapClass = "gap-20", className = "", speed = 0.5 }) {
  const containerRef = useRef(null);
  const flexRef = useRef(null);
  const x = useMotionValue(0);
  const isDragging = useRef(false);

  // Smooth auto-scroll animation loop
  useAnimationFrame(() => {
    if (isDragging.current) return;
    if (!flexRef.current) return;

    // With 3 copies, the length of one set of items is 1/3 of the total scrollable width
    const singleWidth = flexRef.current.offsetWidth / 3;
    if (singleWidth <= 0) return;

    // Increment translation
    let currentX = x.get() - speed;

    // Infinite loop wrapping limits
    if (currentX <= -singleWidth * 2) {
      currentX += singleWidth;
    } else if (currentX >= 0) {
      currentX -= singleWidth;
    }

    x.set(currentX);
  });

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDrag = () => {
    if (!flexRef.current) return;
    const singleWidth = flexRef.current.offsetWidth / 3;
    if (singleWidth <= 0) return;

    let currentX = x.get();
    
    // Wrap around boundaries during drag to keep it infinite
    if (currentX <= -singleWidth * 2) {
      x.set(currentX + singleWidth);
    } else if (currentX >= 0) {
      x.set(currentX - singleWidth);
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full max-w-[1600px] mx-auto overflow-hidden relative cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 80px'
      }}
    >
      {/* GPU-accelerated absolute gradient overlays for side fading */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg-dark to-transparent z-10 pointer-events-none" />

      <motion.div 
        ref={flexRef}
        drag="x"
        dragElastic={0.05}
        dragMomentum={true}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`flex w-max ${gapClass}`}
      >
        {/* Render three copies of children to provide a buffer for bi-directional infinite dragging */}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}
