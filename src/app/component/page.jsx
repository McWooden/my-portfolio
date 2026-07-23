'use client';

import React, { useState, useRef, useEffect } from 'react';
import animmasterData from '../../data/animmaster.json';

function VideoCard({ item, categoryName }) {
  const videoRef = useRef(null);
  const isHovered = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    isHovered.current = true;
    if (videoRef.current) {
      setIsPlaying(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // If the user hovered out before the play promise finished resolving, pause immediately
            if (!isHovered.current && videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
              setIsPlaying(false);
            }
          })
          .catch(error => {
            // Ignore browser-expected playback interruption warnings
            if (error.name !== 'AbortError') {
              console.error('Play error:', error);
            }
          });
      }
    }
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
    if (videoRef.current) {
      setIsPlaying(false);
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-[#262626] border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:border-accent/40 group flex flex-col justify-between"
    >
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={item.videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Play Overlay Indicator when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-4 flex flex-col gap-1.5 select-none shrink-0 bg-[#262626]">
        <h4 className="text-xs font-mono text-neutral-200 truncate" title={item.name}>
          {item.name}
        </h4>
      </div>
    </div>
  );
}

export default function ComponentCatalog() {
  const [activeCategory, setActiveCategory] = useState(animmasterData[0]?.category || '');
  const [currentPage, setCurrentPage] = useState(1);

  const activeCategoryData = animmasterData.find(c => c.category === activeCategory);
  
  // Pagination calculations
  const itemsPerPage = 12;
  const totalItems = activeCategoryData?.items.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = activeCategoryData?.items.slice(startIndex, endIndex) || [];

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] text-neutral-300 flex">
      
      {/* Fixed Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#1f1f1f] p-5 shrink-0 flex flex-col justify-between fixed top-0 bottom-0 left-0 overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
              AnimMaster
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Component Catalog</span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {animmasterData.map((cat) => {
              const isActive = cat.category === activeCategory;
              return (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryChange(cat.category)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-sans font-medium transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    isActive 
                      ? 'bg-accent text-bg-dark font-semibold' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{cat.category}</span>
                  <span className={`text-[10px] font-mono shrink-0 ml-2 px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-bg-dark/15 text-bg-dark' : 'bg-white/5 text-neutral-500'
                  }`}>
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back to Home Link */}
        <div className="pt-4 border-t border-white/5 shrink-0">
          <a 
            href="/" 
            className="text-[10px] font-mono text-accent hover:underline flex items-center gap-1.5"
          >
            ← Back to Home
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pl-64 bg-[#1a1a1a] flex flex-col justify-between">
        <div className="w-full flex flex-col">

          {/* Video Grid */}
          <div className="p-8 pb-24">
            {paginatedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((item) => (
                  <VideoCard 
                    key={item.id} 
                    item={item} 
                    categoryName={activeCategory} 
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-neutral-500">
                <span className="text-xs font-mono">No components found in this category.</span>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Floating Pagination Bar */}
        {totalPages > 1 && (
          <div className="fixed bottom-6 left-1/2 md:left-[calc(50%+128px)] -translate-x-1/2 z-30">
            <div className="bg-[#1f1f1f]/90 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 flex items-center gap-4 text-[10px] text-neutral-300 shadow-2xl">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-default"
              >
                Prev
              </button>
              <span className="font-mono text-neutral-400">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-default"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
