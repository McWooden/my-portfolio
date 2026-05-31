import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiExternalLink, FiLinkedin, FiTwitter, FiGithub, FiUser } from 'react-icons/fi';

const people = [
  {
    id: 1,
    name: 'Alina Rostova',
    role: 'Co-Founder, Onyx Skincare',
    avatar: 'https://framerusercontent.com/images/v4L6r5bO1P0gFP6z0HYvFxRmcYw.png?scale-down-to=512&width=1024&height=1024',
    x: 380,
    y: 220,
    website: 'https://onyxskincare.com',
    social: 'https://linkedin.com/in/alinarostova',
    socialType: 'linkedin'
  },
  {
    id: 2,
    name: 'Johnathan Doe',
    role: 'Lead Frontend Architect',
    avatar: 'https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024',
    x: 700,
    y: 160,
    website: 'https://johndoe.dev',
    social: 'https://github.com/johndoe',
    socialType: 'github'
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    role: 'Senior Product Designer',
    avatar: 'https://framerusercontent.com/images/qMrMTWyggoctZktmN3xk9LziWM.png?width=1024&height=1024',
    x: 1020,
    y: 220,
    website: 'https://sarahj.design',
    social: 'https://linkedin.com/in/sarahj',
    socialType: 'linkedin'
  },
  {
    id: 4,
    name: 'Marcus Brody',
    role: 'Creative Director',
    avatar: 'https://framerusercontent.com/images/LVcACvWfr9MemEEBhRIZ9Mj0A.png?width=1024&height=1024',
    x: 360,
    y: 680,
    website: 'https://marcusbrody.co',
    social: 'https://linkedin.com/in/marcusbrody',
    socialType: 'linkedin'
  },
  {
    id: 5,
    name: 'Elena Gilbert',
    role: 'SaaS Founder & Writer',
    avatar: 'https://framerusercontent.com/images/v4L6r5bO1P0gFP6z0HYvFxRmcYw.png?scale-down-to=512&width=1024&height=1024',
    x: 1040,
    y: 680,
    website: 'https://elenag.io',
    social: 'https://twitter.com/elenagilbert',
    socialType: 'twitter'
  },
  {
    id: 6,
    name: 'David Miller',
    role: 'Brand Consultant',
    avatar: 'https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png?width=1024&height=1024',
    x: 700,
    y: 740,
    website: 'https://davidmiller.agency',
    social: 'https://linkedin.com/in/davidmiller',
    socialType: 'linkedin'
  }
];

const centerNode = {
  name: 'Sholahuddin Ahmad',
  role: 'Full-Stack Developer',
  avatar: 'https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png?width=1024&height=1024',
  x: 700,
  y: 450
};

const BOARD_WIDTH = 1400;
const BOARD_HEIGHT = 900;

export default function NetworkMap() {
  const viewportRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Recenter function based on active viewport bounds
  const recenterBoard = () => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const initialX = (rect.width - BOARD_WIDTH) / 2;
      const initialY = (rect.height - BOARD_HEIGHT) / 2;
      setPan({ x: initialX, y: initialY });
    }
  };

  // Center on load
  useEffect(() => {
    recenterBoard();
  }, []);

  // Recenter when switching fullscreen viewports
  useEffect(() => {
    const timer = setTimeout(recenterBoard, 100);
    return () => clearTimeout(timer);
  }, [isFullScreen]);

  // Lock document scroll when fullscreen is active
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  // Prevent wheel scrolling when cursor is on the map
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    const preventWheelScroll = (e) => {
      e.preventDefault();
    };

    viewport.addEventListener('wheel', preventWheelScroll, { passive: false });
    return () => viewport.removeEventListener('wheel', preventWheelScroll);
  }, []);

  const handleMouseDown = (e) => {
    // Only handle left click dragging on the background
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const minX = rect.width - BOARD_WIDTH - 200;
      const maxX = 200;
      const minY = rect.height - BOARD_HEIGHT - 200;
      const maxY = 200;

      setPan({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.current.x;
    const newY = touch.clientY - dragStart.current.y;

    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const minX = rect.width - BOARD_WIDTH - 200;
      const maxX = 200;
      const minY = rect.height - BOARD_HEIGHT - 200;
      const maxY = 200;

      setPan({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    }
  };

  const getSocialIcon = (type) => {
    switch (type) {
      case 'linkedin': return <FiLinkedin className="w-4 h-4" />;
      case 'twitter': return <FiTwitter className="w-4 h-4" />;
      case 'github': return <FiGithub className="w-4 h-4" />;
      default: return <FiUser className="w-4 h-4" />;
    }
  };

  const getCardStyle = (node) => {
    if (!node) return {};
    const cardWidth = 300;
    const cardHeight = 390;
    const gap = 40;

    let left = node.x + gap;
    if (node.x >= BOARD_WIDTH / 2) {
      left = node.x - cardWidth - gap;
    }

    let top = node.y - cardHeight / 2;
    top = Math.max(20, Math.min(BOARD_HEIGHT - cardHeight - 20, top));

    return { 
      left: `${left}px`, 
      top: `${top}px`,
      width: `${cardWidth}px`
    };
  };

  const mapContent = (
    <div 
      ref={viewportRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      className={`bg-[#121212] select-none touch-none transition-all duration-300 ${
        isFullScreen 
          ? 'fixed inset-0 w-screen h-screen z-[2000] overflow-hidden' 
          : 'relative w-full max-w-[800px] h-[50vh] aspect-square mx-auto rounded-[30px] border border-border mt-10 overflow-hidden'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* Draggable FigJam Board Canvas Container */}
      <div 
        className="absolute transition-transform duration-75 ease-out"
        style={{ 
          width: `${BOARD_WIDTH}px`, 
          height: `${BOARD_HEIGHT}px`,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${isFullScreen ? 1 : 0.6})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Connection SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
          {people.map((node) => {
            const isHighlighted = selectedNode?.id === node.id || hoveredNode?.id === node.id;
            return (
              <line
                key={node.id}
                x1={centerNode.x}
                y1={centerNode.y}
                x2={node.x}
                y2={node.y}
                stroke={isHighlighted ? '#E0FF6F' : 'rgba(234, 234, 234, 0.08)'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Center Node (Me) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
          style={{ left: `${centerNode.x}px`, top: `${centerNode.y}px` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-[66px] h-[66px] bg-[#E0FF6F] p-[3px] rounded-full shadow-[0_0_20px_rgba(224,255,111,0.4)]">
              <img
                src={centerNode.avatar}
                alt={centerNode.name}
                className="w-full h-full rounded-full object-cover border border-bg-dark"
              />
            </div>
            {/* Center label */}
            <span className="absolute top-[76px] whitespace-nowrap bg-bg-dark border border-border px-3 py-1 rounded-full text-[0.8rem] font-mono uppercase tracking-tight text-white font-medium">
              ME
            </span>
          </div>
        </div>

        {/* Peer/Client Nodes */}
        {people.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none cursor-pointer"
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
            >
              <div 
                className={`w-[52px] h-[52px] rounded-full p-[2px] bg-bg-card border-2 transition-all duration-300 hover:scale-110 ${
                  isSelected 
                    ? 'border-accent shadow-[0_0_15px_rgba(224,255,111,0.5)] scale-105' 
                    : isHovered 
                      ? 'border-accent/60 scale-105' 
                      : 'border-border'
                }`}
              >
                <img
                  src={node.avatar}
                  alt={node.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </button>
          );
        })}

        {/* Absolute Detail Profile Card Overlay next to node on canvas */}
        {selectedNode && (
          <div 
            className="absolute bg-bg-dark border border-border rounded-[24px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 transition-all duration-300 animate-fade-in"
            style={getCardStyle(selectedNode)}
          >
            {/* Avatar & Top Section */}
            <div className="relative w-full h-[240px]">
              <img
                src={selectedNode.avatar}
                alt={selectedNode.name}
                className="w-full h-full object-cover"
              />
              
              {/* Fade Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-dark via-bg-dark/80 to-transparent pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedNode(null)}
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
                  {selectedNode.name}
                </h3>
                <p className="text-[0.85rem] text-[#E0FF6F] font-mono uppercase tracking-wide text-left">
                  {selectedNode.role}
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
                  href={selectedNode.social}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#2a2a2a] text-white border border-border py-2.5 rounded-[12px] font-sans font-medium text-[0.9rem] hover:bg-[#333333] transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {getSocialIcon(selectedNode.socialType)}
                  <span>Follow</span>
                </a>
                <a
                  href={selectedNode.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[44px] h-[44px] bg-[#E0FF6F] text-bg-dark rounded-[12px] flex items-center justify-center hover:opacity-90 transition-opacity duration-200 flex-shrink-0"
                  title="Visit Portfolio"
                >
                  <FiExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Instructions HUD */}
      <div className="absolute top-4 left-4 z-40 bg-bg-dark/80 backdrop-blur border border-border/80 px-4 py-2 rounded-full text-[0.8rem] text-text-secondary font-mono uppercase tracking-wider max-md:hidden pointer-events-none">
        Drag to Pan • Click nodes to view
      </div>

      {/* Fullscreen Toggle Button */}
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="absolute top-4 right-4 z-[60] bg-bg-dark/80 hover:bg-bg-dark hover:text-accent border border-border/80 p-2.5 rounded-full text-text-secondary cursor-pointer select-none transition-colors duration-200 focus:outline-none"
        title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullScreen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
          </svg>
        )}
      </button>
    </div>
  );

  if (isFullScreen) {
    return createPortal(mapContent, document.body);
  }

  return mapContent;
}
