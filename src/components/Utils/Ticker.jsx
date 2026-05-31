import React from 'react';
import Marquee from './Marquee';

export default function Ticker() {
  const items = [
    { value: '120+', label: 'projects shipped' },
    { value: 'Over 50', label: 'happy clients' },
    { value: '12-day', label: 'average turnaround' },
    { value: '50+', label: 'positive reviews' },
    { value: '24/7', label: 'client access' }
  ];

  const renderItem = (item, index) => (
    <div key={index} className="flex items-center gap-3">
      <div className="w-5 h-5 text-accent-muted">
        <svg viewBox="0 0 256 256" className="w-full h-full fill-current">
          <path d="M218.29,182.17a12,12,0,0,1-16.47,4.12L140,149.19V216a12,12,0,0,1-24,0V149.19l-61.82,37.1a12,12,0,1,1-12.35-20.58L104.68,128,41.83,90.29A12,12,0,1,1,54.18,69.71L116,106.81V40a12,12,0,0,1,24,0v66.81l61.82-37.1a12,12,0,1,1,12.35,20.58L151.32,128l62.85,37.71A12,12,0,0,1,218.29,182.17Z" />
        </svg>
      </div>
      <span className="font-mono text-2xl font-medium text-accent uppercase">{item.value}</span>
      <span className="font-mono text-2xl font-medium text-text-secondary uppercase">{item.label}</span>
    </div>
  );

  return (
    <section className="w-full max-w-[1600px] mx-auto px-10 max-[810px]:px-5 overflow-hidden bg-bg-dark border-b border-border py-[30px] relative">
      <Marquee gapClass="gap-20" className="w-full">
        {items.map((item, i) => renderItem(item, i))}
      </Marquee>
    </section>
  );
}
