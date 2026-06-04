import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const SectionHeader = ({ index, tag, name, title, subtitle, extraClass = '' }) => {
  const [revealRef, isRevealed] = useScrollReveal(0.05);
  const marginClass = extraClass.includes('mb-') ? '' : 'mb-[60px]';

  return (
    <div className={`flex flex-col items-center w-full max-w-[1600px] mx-auto ${marginClass} ${extraClass}`}>
      
      {/* 1. Meta-Header (Top Row) */}
      <div 
        ref={revealRef}
        className={`flex flex-row items-center justify-between w-full font-mono text-[14px] md:text-[16px] font-normal tracking-[-0.2px] md:tracking-[-0.32px] uppercase gap-2 flex-wrap md:flex-nowrap pb-4 reveal-item ${isRevealed ? 'revealed' : ''}`}
      >
        
        {/* Part A (Index/Star): Left-aligned */}
        <div className="flex items-center justify-start text-[#E0FF6F] min-w-[80px]">
            <span>{index ?? '✦'}</span>
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
