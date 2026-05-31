import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * SectionHeader Component
 * 
 * Replicates the complex headline layout:
 * 1. Meta-Header (Top Row):
 *    - Flex container with 3 distinct parts spaced evenly.
 *    - Font: DM Mono, 16px, 400 weight, letter-spacing -0.32px, uppercase.
 *    - Part A: Index/Star. Index prop (Electric Lime #E0FF6F) or Star SVG if null/undefined.
 *    - Part B: Context. Central text prop in Off-White (#F2F2F2).
 *    - Part C: Category. Right-aligned text prop in muted Electric Lime (rgba(224, 225, 111, 0.5)).
 * 2. Primary Title:
 *    - Centered below top row with a gap of 60px.
 *    - Font: Inter, 56px (scaled on mobile), weight 500.
 *    - Color: Off-White (#F2F2F2).
 *    - Letter-Spacing: -3.36px (scaled on mobile).
 *    - Line-Height: 1.1x (61.6px).
 * 3. Sub-Description:
 *    - Centered below title with a gap of 10px.
 *    - Font: Inter, 18px, weight 400.
 *    - Color: Off-White (#F2F2F2).
 *    - Line-Height: 1.4x (25.2px).
 */
const SectionHeader = ({ index, tag, name, title, subtitle }) => {
  const showStar = index === null || index === undefined;
  const [revealRef, isRevealed] = useScrollReveal(0.05);

  return (
    <div className="flex flex-col items-center w-full max-w-[1600px] mx-auto mb-[60px]">
      
      {/* 1. Meta-Header (Top Row) */}
      <div 
        ref={revealRef}
        className={`flex flex-row items-center justify-between w-full font-mono text-[14px] md:text-[16px] font-normal tracking-[-0.2px] md:tracking-[-0.32px] uppercase gap-2 flex-wrap md:flex-nowrap pb-4 reveal-item ${isRevealed ? 'revealed' : ''}`}
      >
        
        {/* Part A (Index/Star): Left-aligned */}
        <div className="flex items-center justify-start text-[#E0FF6F] min-w-[80px]">
          {showStar ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-[#E0FF6F]"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ) : (
            <span>{index}</span>
          )}
        </div>

        {/* Part B (Context): Central text */}
        <div className="text-[#F2F2F2] text-center flex-1">
          {tag || ''}
        </div>

        {/* Part C (Category): Right-aligned, muted Electric Lime */}
        <div className="text-right min-w-[80px]" style={{ color: 'rgba(224, 255, 111, 0.5)' }}>
          {name || ''}
        </div>
      </div>

      {/* 2. Primary Title (Centered below top row with a gap of 60px) */}
      {title && (
        <h2 className="mt-[60px] text-center w-full max-w-[800px] mx-auto text-[32px] md:text-[56px] font-medium text-[#F2F2F2] tracking-[-1.5px] md:tracking-[-3.36px] leading-[1.2] md:leading-[61.6px]">
          {title}
        </h2>
      )}

      {/* 3. Sub-Description (Centered below title with a gap of 10px) */}
      {subtitle && (
        <p className="mt-[10px] text-center text-[15px] md:text-[18px] font-normal text-[#F2F2F2] leading-[1.4] md:leading-[25.2px] max-w-[800px]">
          {subtitle}
        </p>
      )}
      
    </div>
  );
};

export default SectionHeader;
