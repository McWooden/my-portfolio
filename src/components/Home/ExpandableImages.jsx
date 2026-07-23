"use client";
import React from 'react';

const projectImages = [
  "https://framerusercontent.com/images/XHEChVekS6RzYRttHyDfrU.png?width=1536&height=768", // Onyx Skincare
  "https://framerusercontent.com/images/prADa1IjoRBMAk5VcwnCnemeG4.png", // Nova
  "https://framerusercontent.com/images/uEz9dCltMLP4KTajvtu99EP2ck.png", // Fieldtype
  "https://framerusercontent.com/images/ZjwRUmKHfNUConryEH3JLOt0kU.png"  // Alder & Co
];

export default function ExpandableImages() {
  return (
    <div 
      className="w-full h-full flex p-0 overflow-hidden select-none bg-bg-card"
    >
      {projectImages.map((src, idx) => (
        <div
          key={idx}
          className="h-full flex-1 transition-all duration-500 ease-in-out hover:flex-[2] relative overflow-hidden cursor-pointer group"
        >
          <img
            src={src}
            alt={`Project preview ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 ease-out group-hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
}
