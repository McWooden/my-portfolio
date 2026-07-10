'use client';

import React from 'react';
import { FiBold, FiItalic, FiLink, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';

export default function FormatTooltip({
  showTooltip,
  tooltipPos,
  handleFormat,
  toggleBlock,
  cycleAlignment,
  currentAlignment,
  isH2Active,
  isH3Active
}) {
  if (!showTooltip) return null;

  return (
    <div 
      className="absolute z-50 bg-bg-card border border-neutral-800 px-2 py-1.5 rounded-xl flex items-center gap-1 shadow-2xl transition-all duration-150 -translate-x-1/2"
      style={{ 
        top: `${tooltipPos.top}px`, 
        left: `${tooltipPos.left}px` 
      }}
    >
      <button
        onClick={() => handleFormat('bold')}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-neutral-800 rounded-lg text-sm text-neutral-300 hover:text-white cursor-pointer flex items-center justify-center"
        title="Bold"
      >
        <FiBold className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleFormat('italic')}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-neutral-800 rounded-lg text-sm text-neutral-300 hover:text-white cursor-pointer flex items-center justify-center"
        title="Italic"
      >
        <FiItalic className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => toggleBlock('H2')}
        onMouseDown={(e) => e.preventDefault()}
        className={`w-7 h-7 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors duration-150 flex items-center justify-center ${isH2Active ? 'text-accent' : 'text-neutral-400'}`}
        title="Toggle H2"
      >
        <span className="font-mono font-bold text-[16px] leading-none select-none" style={{ fontFamily: 'monospace' }}>T</span>
      </button>
      <button
        onClick={() => toggleBlock('H3')}
        onMouseDown={(e) => e.preventDefault()}
        className={`w-7 h-7 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors duration-150 flex items-center justify-center ${isH3Active ? 'text-accent' : 'text-neutral-400'}`}
        title="Toggle H3"
      >
        <span className="font-mono font-bold text-[11px] leading-none select-none" style={{ fontFamily: 'monospace' }}>T</span>
      </button>
      <button
        onClick={cycleAlignment}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-neutral-800 rounded-lg text-sm text-neutral-300 hover:text-white cursor-pointer flex items-center justify-center"
        title={`Align: ${currentAlignment}`}
      >
        {currentAlignment === 'center' ? (
          <FiAlignCenter className="w-3.5 h-3.5" />
        ) : currentAlignment === 'right' ? (
          <FiAlignRight className="w-3.5 h-3.5" />
        ) : (
          <FiAlignLeft className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        onClick={() => {
          const url = prompt('Enter link URL:');
          if (url) handleFormat('createLink', url);
        }}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-neutral-800 rounded-lg text-sm text-neutral-300 hover:text-white cursor-pointer flex items-center justify-center"
        title="Link"
      >
        <FiLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
