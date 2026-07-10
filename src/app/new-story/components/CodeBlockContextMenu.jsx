'use client';

import React from 'react';

export default function CodeBlockContextMenu({
  contextMenu,
  moveCodeBlockUp,
  moveCodeBlockDown,
  addCodeBlockParagraphBefore,
  addCodeBlockParagraphAfter,
  splitCodeBlockAtCursor,
  deleteCodeBlock,
}) {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed z-[100] bg-neutral-950/95 border border-neutral-900 rounded-2xl py-2 px-1.5 min-w-[200px] shadow-2xl flex flex-col gap-0.5"
      style={{
        top: typeof window !== 'undefined' ? Math.min(contextMenu.y, window.innerHeight - 250) : contextMenu.y,
        left: typeof window !== 'undefined' ? Math.min(contextMenu.x, window.innerWidth - 220) : contextMenu.x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={moveCodeBlockUp}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>↑</span> Move Up
      </button>
      <button
        onClick={moveCodeBlockDown}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>↓</span> Move Down
      </button>
      <div className="h-[1px] bg-neutral-900/60 my-1" />
      <button
        onClick={addCodeBlockParagraphBefore}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>¶↑</span> Paragraph Before
      </button>
      <button
        onClick={addCodeBlockParagraphAfter}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>¶↓</span> Paragraph After
      </button>
      <div className="h-[1px] bg-neutral-900/60 my-1" />
      <button
        onClick={splitCodeBlockAtCursor}
        className="w-full text-left px-4 py-2 hover:bg-neutral-900 rounded-xl text-xs text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>✂</span> Split Code Block
      </button>
      <div className="h-[1px] bg-neutral-900/60 my-1" />
      <button
        onClick={deleteCodeBlock}
        className="w-full text-left px-4 py-2 hover:bg-red-950/40 hover:text-red-400 rounded-xl text-xs text-red-500 flex items-center gap-2 cursor-pointer font-mono"
      >
        <span>✕</span> Delete Block
      </button>
    </div>
  );
}
