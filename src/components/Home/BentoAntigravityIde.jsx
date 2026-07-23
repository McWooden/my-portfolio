'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Files, Search, GitBranch, Blocks, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOTIVATIONAL_QUOTES = [
  "Code is like humor. When you have to explain it, it’s bad. Keep it simple!",
  "Fix the cause, not the symptom. The best error message is the one that never shows up.",
  "First, solve the problem. Then, write the code. Step by step, you're building greatness!",
  "Make it work, make it right, make it fast. Every bug fixed is progress.",
  "Consistency beats intensity. Little increments of clean code build beautiful houses.",
  "Don't comment bad code—rewrite it. Keep your standards high and your code clean.",
  "The only way to learn a new programming language is by writing programs in it.",
  "Simplicity is the soul of efficiency. Write code that your future self will thank you for."
];

export default function BentoAntigravityIde() {
  const [activeTab, setActiveTab] = useState(0);
  const [motivation, setMotivation] = useState(MOTIVATIONAL_QUOTES[0]);
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, text: '✓ Compiling assets...' },
    { id: 2, text: '✓ Ready to code!' }
  ]);
  const terminalRef = useRef(null);
  const workspaceRef = useRef(null);

  // Height state of the terminal. Default is 45px (roughly 20% of workspace).
  const [terminalHeight, setTerminalHeight] = useState(45);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const dragMaxHeight = useRef(160);

  // Set initial terminal height to exactly 20% of workspace height on mount
  useEffect(() => {
    if (workspaceRef.current) {
      setTerminalHeight(Math.round(workspaceRef.current.clientHeight * 0.2));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [terminalLogs]);

  const handleDragStart = (e) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartHeight.current = terminalHeight;
    dragMaxHeight.current = workspaceRef.current ? workspaceRef.current.clientHeight : 190;

    const handleMouseMove = (moveEvent) => {
      const deltaY = dragStartY.current - moveEvent.clientY;
      const newHeight = Math.max(0, Math.min(dragMaxHeight.current, dragStartHeight.current + deltaY));
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartHeight.current = terminalHeight;
    dragMaxHeight.current = workspaceRef.current ? workspaceRef.current.clientHeight : 190;

    const handleTouchMove = (moveEvent) => {
      const deltaY = dragStartY.current - moveEvent.touches[0].clientY;
      const newHeight = Math.max(0, Math.min(dragMaxHeight.current, dragStartHeight.current + deltaY));
      setTerminalHeight(newHeight);
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleIconClick = (index) => {
    setActiveTab(index);
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setMotivation(randomQuote);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs(prev => [
      ...prev,
      { id: Date.now(), text: `[${timestamp}] Switched tab #${index + 1}` }
    ]);
  };

  return (
    <div className="w-full h-full min-h-[260px] bg-bg-card border border-border rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-xl select-none font-mono text-neutral-300">
      
      {/* Top Bar with Traffic Lights and Project Title */}
      <div className="flex items-center justify-between pb-3 pt-4 px-5 bg-bg-dark border-b border-border/40 -mx-5 -mt-5 mb-4 shrink-0 text-[10px] text-neutral-400 font-sans">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
        </div>
        <div className="text-center text-[9px] sm:text-[10px] text-neutral-400 select-none mx-2 whitespace-nowrap">
          HaloHuddin - Antigravity IDE - Home.jsx
        </div>
        <div className="w-[48px] shrink-0 flex items-center justify-end text-neutral-400">
          <Layout className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Vertical Bar: 4 Icons */}
        <div className="flex flex-col items-center py-1 pr-3 gap-5 shrink-0 border-r border-white/5 mr-1">
          {[
            { icon: Files, label: 'Explorer' },
            { icon: Search, label: 'Search' },
            { icon: GitBranch, label: 'Source Control' },
            { icon: Blocks, label: 'Extensions' }
          ].map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                title={item.label}
                onClick={() => handleIconClick(idx)}
                className={`p-1.5 rounded-lg cursor-pointer transition-colors duration-150 ${
                  isActive 
                    ? 'text-white bg-white/10' 
                    : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Right Side Area */}
        <div 
          ref={workspaceRef} 
          className="flex-1 flex flex-col justify-between overflow-hidden pl-2 relative min-h-0"
        >
          
          {/* Motivation Content Area (Remains at standard flow) */}
          <div className="w-full flex flex-col justify-start items-start overflow-hidden p-0 pt-1 min-h-0">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={motivation}
                initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                className="text-white text-xs sm:text-sm leading-relaxed font-sans font-normal italic text-left"
              >
                "{motivation}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Terminal Console (Absolute overlay bottom panel) */}
          <div 
            style={{ height: `${terminalHeight}px` }} 
            className={`absolute bottom-0 left-2 right-0 bg-bg-card flex flex-col justify-between z-10 transition-all duration-75 ${
              terminalHeight > 0 ? 'border-t border-white/5 pt-2' : ''
            }`}
          >
            {/* Resizable Drag Handle */}
            <div 
              onMouseDown={handleDragStart}
              onTouchStart={handleTouchStart}
              className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize z-20 group flex justify-center"
              title="Drag to resize terminal"
            >
              <div className="w-full h-[2px] bg-transparent group-hover:bg-accent/40 group-active:bg-accent/60 transition-colors relative flex justify-center">
                {terminalHeight === 0 && (
                  <div className="w-8 h-1 rounded-full bg-neutral-600 group-hover:bg-accent transition-colors absolute -top-0.5" />
                )}
              </div>
            </div>

            {terminalHeight > 25 && (
              <div className="flex-1 flex flex-col justify-between min-h-0">
                <div className="text-[10px] text-neutral-400 font-sans font-bold uppercase tracking-wider shrink-0">
                  Terminal
                </div>
                <div 
                  ref={terminalRef} 
                  className="w-full flex-1 overflow-y-auto flex flex-col gap-1 text-[10px] font-mono scrollbar-thin scrollbar-thumb-neutral-700 mt-1"
                >
                  {terminalLogs.map((log) => (
                    <div key={log.id} className="w-full truncate text-accent shrink-0">
                      {log.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Minimal Footer Status Bar */}
      <div className="flex items-center justify-between py-2 px-5 text-[10px] text-neutral-400 font-sans bg-bg-card-hover border-t border-border/40 -mx-5 -mb-5 rounded-b-3xl shrink-0 mt-4">
        <span>main*</span>
        <span className="font-mono text-[9px] text-neutral-300">UTF-8</span>
      </div>
    </div>
  );
}
