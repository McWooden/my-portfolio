import React from 'react';
import { FiExternalLink, FiLinkedin, FiTwitter, FiGithub, FiUser } from 'react-icons/fi';

const IS_DEV = process.env.NODE_ENV === 'development';

const getSocialIcon = (type) => {
  switch (type) {
    case 'linkedin': return <FiLinkedin className="w-4 h-4" />;
    case 'twitter': return <FiTwitter className="w-4 h-4" />;
    case 'github': return <FiGithub className="w-4 h-4" />;
    default: return <FiUser className="w-4 h-4" />;
  }
};

export default function NodeDetailCard({ node, cardStyle, onClose, onStartEdit }) {
  if (!node) return null;

  return (
    <div 
      className="absolute bg-bg-dark border border-border rounded-3xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 transition-all duration-300 animate-fade-in text-left"
      style={cardStyle}
    >
      {/* Avatar & Top Section */}
      <div className="relative w-full h-[240px]">
        <img
          src={node.avatar}
          alt={node.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Fade Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-dark via-bg-dark/80 to-transparent pointer-events-none" />

        {/* Dev Edit Button */}
        {IS_DEV && (
          <button
            onClick={() => onStartEdit(node)}
            className="absolute top-4 left-4 w-8 h-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-accent hover:bg-black/60 cursor-pointer select-none focus:outline-none transition-colors z-10"
            title="Edit Node Info"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 cursor-pointer select-none focus:outline-none transition-colors z-10"
          aria-label="Close Profile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Text overlay at the bottom of the avatar */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-2 flex flex-col gap-1 z-10">
          <h3 className="text-[1.4rem] font-semibold text-white tracking-tight leading-none text-left">
            {node.name}
          </h3>
          <p className="text-[0.85rem] text-[#E0FF6F] font-mono uppercase tracking-wide text-left">
            {node.role}
          </p>
        </div>
      </div>

      {/* Information & Action buttons */}
      <div className="flex flex-col px-5 pb-5 pt-3 bg-bg-dark w-full">
        <p className="text-[0.85rem] text-text-secondary leading-relaxed mb-4 text-left">
          Part of my professional network. Connected on collaborative projects and design workflows.
        </p>

        <div className="flex flex-row gap-2.5 w-full mt-auto">
          <a
            href={node.social}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#2a2a2a] text-white border border-border py-2.5 rounded-xl font-sans font-medium text-[0.9rem] hover:bg-[#333333] transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {getSocialIcon(node.socialType)}
            <span>Follow</span>
          </a>
          <a
            href={node.website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 bg-[#E0FF6F] text-bg-dark rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity duration-200 flex-shrink-0"
            title="Visit Portfolio"
          >
            <FiExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
