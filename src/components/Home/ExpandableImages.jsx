"use client";
import React, { useState, useEffect, useRef } from 'react';

const projectImages = [
  "https://framerusercontent.com/images/XHEChVekS6RzYRttHyDfrU.png?width=1536&height=768", // Onyx Skincare
  "https://framerusercontent.com/images/prADa1IjoRBMAk5VcwnCnemeG4.png", // Nova
  "https://framerusercontent.com/images/uEz9dCltMLP4KTajvtu99EP2ck.png", // Fieldtype
  "https://framerusercontent.com/images/ZjwRUmKHfNUConryEH3JLOt0kU.png"  // Alder & Co
];

export default function ExpandableImages() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const imgRefs = useRef([]);

  const handleImageLoad = (idx) => {
    setLoadedImages(prev => ({ ...prev, [idx]: true }));
  };

  useEffect(() => {
    // Check if images are already complete (loaded from cache)
    imgRefs.current.forEach((img, idx) => {
      if (img && img.complete) {
        handleImageLoad(idx);
      }
    });
  }, []);

  return (
    <div 
      className="w-full h-full flex gap-[6px] p-0 overflow-hidden rounded-[22px] select-none bg-bg-card"
      style={{
        isolation: 'isolate',
        transform: 'translate3d(0, 0, 0)',
      }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {projectImages.map((src, idx) => (
        <div
          key={idx}
          onMouseEnter={() => setHoveredIndex(idx)}
          className={`h-full relative overflow-hidden cursor-pointer transition-all duration-300 ${
            !loadedImages[idx] ? 'bg-neutral-800/80 animate-pulse' : ''
          }`}
          style={{
            flex: hoveredIndex === null ? '1 1 0%' : hoveredIndex === idx ? '2.5 1 0%' : '0.75 1 0%',
            minWidth: 0,
            transition: 'flex 500ms cubic-bezier(0.25, 1, 0.3, 1)',
            willChange: 'flex',
            isolation: 'isolate',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <img
            ref={el => imgRefs.current[idx] = el}
            src={src}
            onLoad={() => handleImageLoad(idx)}
            alt={`Project preview ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${
              loadedImages[idx] ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: hoveredIndex === idx ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 700ms cubic-bezier(0.25, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          />
          {/* Visual premium overlay: dim other columns slightly when one is focused */}
          <div 
            className="absolute inset-0 bg-black pointer-events-none"
            style={{
              opacity: hoveredIndex === null ? 0 : hoveredIndex === idx ? 0 : 0.35,
              transition: 'opacity 500ms ease',
              willChange: 'opacity',
            }}
          />
        </div>
      ))}
    </div>
  );
}
