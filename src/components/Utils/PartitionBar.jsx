import React from 'react';

/**
 * Reusable partition status bar — renders the colored availability segments.
 * Extracted from Header.jsx where it was duplicated 3× (mobile badge, desktop badge, mobile menu).
 */
export default function PartitionBar({ partitions, className = '' }) {
  const getSegmentStyle = (val) => {
    if (val === 'open') return { backgroundColor: '#c6ff34' };
    if (val === 'me') return { backgroundColor: '#6CCFF6' };
    if (val === 'working') return { backgroundColor: '#FE7F2D' };
    return { backgroundColor: '#AC58E9' }; // campus
  };

  return (
    <div className={`flex rounded-full overflow-hidden shrink-0 border border-white/10 ${className}`}>
      {partitions.map((val, idx) => (
        <span
          key={idx}
          className="flex-1 h-full"
          style={getSegmentStyle(val)}
        />
      ))}
    </div>
  );
}
