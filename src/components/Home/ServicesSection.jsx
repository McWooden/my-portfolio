import React from 'react';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function ServicesSection() {
  const servicesList = [
    { n: 1, title: 'Brand Identity', desc: "Logos, colors, and typography systems that reflect who you are — and stick in people's minds" },
    { n: 2, title: 'Presentations', desc: 'Pitch decks, client proposals, and internal docs that look as sharp as your ideas' },
    { n: 3, title: 'Social Media', desc: 'Templates and visuals that make your content scroll-stopping and on-brand across every platform' },
    { n: 4, title: 'Print', desc: 'Print & Packaging: Business cards, posters, labels — tangible design with real-world impact' },
  ];

  const [gridRef, isRevealed] = useScrollReveal(0.05);

  return (
    <Section id="services" borderBottom={false}>
      <SectionHeader
        index="01"
        tag="What i do"
        name="Services"
        title="Design systems for consistent, standout brands"
        subtitle="From logos to layouts — clear, cohesive, and impossible to ignore"
      />
      <div 
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[30px] w-full max-w-[1600px]"
      >
        {servicesList.map(({ n, title, desc }, index) => (
          <div
            key={n}
            className={`bg-bg-card rounded-[30px] p-[40px] flex flex-col gap-6 text-left reveal-item ${isRevealed ? 'revealed' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-row items-center gap-[10px]">
              <div className="w-[40px] h-[40px] bg-accent rounded-[15px] flex items-center justify-center">
                <span className="font-mono text-[24px] font-normal text-bg-dark tracking-[-0.48px] uppercase">
                  {n}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[26px] font-medium text-[#F2F2F2] tracking-[-1.56px] leading-tight">{title}</h4>
              <p className="text-[16px] font-normal text-text-secondary leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
