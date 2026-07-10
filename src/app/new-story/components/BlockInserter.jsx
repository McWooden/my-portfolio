'use client';

import React from 'react';
import { FiImage } from 'react-icons/fi';

export default function BlockInserter({
  showGutterButton,
  isLineEmpty,
  triggerImageUpload,
  insertEmbed,
  insertCodeBlock
}) {
  if (!showGutterButton || !isLineEmpty) return null;

  return (
    <div className="block-inserter fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-neutral-950/85 backdrop-blur-md border border-neutral-900 p-2.5 rounded-2xl flex items-center gap-2 shadow-2xl transition-all duration-300 hover:border-neutral-800">
      <button
        onClick={triggerImageUpload}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white cursor-pointer flex items-center justify-center"
        title="Add Image"
      >
        <FiImage className="w-4 h-4" />
      </button>
      <button
        onClick={insertEmbed}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white cursor-pointer flex items-center justify-center min-w-8 h-8"
        title="Add Embed"
      >
        <span className="font-mono font-bold text-xs tracking-tight select-none">&lt;&thinsp;&gt;</span>
      </button>
      <button
        onClick={insertCodeBlock}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white cursor-pointer flex items-center justify-center min-w-8 h-8"
        title="Add Code Block"
      >
        <span className="font-mono font-bold text-xs tracking-tight select-none">&#123;&thinsp;&#125;</span>
      </button>
    </div>
  );
}
