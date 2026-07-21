import React from 'react';

/**
 * Reusable status details tooltip — shows Open/Working/Campus/Me Time breakdown.
 * Extracted from Header.jsx where it was duplicated 3× (mobile badge, desktop badge, mobile menu).
 */
export default function StatusTooltip({ partitions, className = '', isOpen = false }) {
  const openCount = partitions.filter(p => p === 'open').length;
  const workingCount = partitions.filter(p => p === 'working').length;
  const campusCount = partitions.filter(p => p === 'campus').length;
  const meCount = partitions.filter(p => p === 'me').length;

  return (
    <div className={`absolute bg-neutral-900 border border-neutral-800/80 px-3 py-2.5 rounded-xl text-[10px] font-mono text-neutral-400 ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    } group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-2xl whitespace-nowrap z-50 text-left flex flex-col gap-1 ${className}`}>
      <div className="font-sans font-normal text-white border-b border-neutral-800 pb-1 mb-0.5">Status Details</div>
      <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c6ff34' }} />{openCount} Open Slot{openCount !== 1 ? 's' : ''}</div>
      <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FE7F2D' }} />{workingCount} Working</div>
      <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#AC58E9' }} />{campusCount} Campus/Org</div>
      <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6CCFF6' }} />{meCount} Me Time</div>
    </div>
  );
}
