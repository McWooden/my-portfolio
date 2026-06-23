'use client';

import React from 'react';

export default function ImageContextMenu({
  contextMenu,
  moveImageUp,
  moveImageDown,
  addParagraphBefore,
  addParagraphAfter,
  addCaption,
  deleteImage
}) {
  if (!contextMenu) return null;

  return (
    <div 
      className="fixed z-[100] bg-neutral-950/90 backdrop-blur-xl border border-neutral-900 rounded-2xl py-2 px-1.5 min-w-[180px] shadow-2xl flex flex-col gap-0.5"
      style={{ 
        top: `${contextMenu.y}px`, 
        left: `${contextMenu.x}px` 
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={moveImageUp}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>↑</span> Move Up
      </button>
      <button
        onClick={moveImageDown}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>↓</span> Move Down
      </button>
      <div className="h-[1px] bg-neutral-900/60 my-1" />
      <button
        onClick={addParagraphBefore}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>↵</span> Paragraph Before
      </button>
      <button
        onClick={addParagraphAfter}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>↵</span> Paragraph After
      </button>
      <button
        onClick={addCaption}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>✎</span> Add Caption
      </button>
      <div className="h-[1px] bg-neutral-900/60 my-1" />
      <button
        onClick={deleteImage}
        className="w-full text-left px-4 py-2 hover:bg-red-950/40 hover:text-red-400 rounded-xl text-xs text-red-500 transition-colors duration-150 flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>✕</span> Delete Image
      </button>
    </div>
  );
}
