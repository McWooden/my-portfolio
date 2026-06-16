"use client";
import React, { useState, useRef, useEffect } from 'react';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { services } from '../../data/siteData';

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState(services.tabs[0]);
  const [displayTab, setDisplayTab] = useState(services.tabs[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [gridRef, isRevealed] = useScrollReveal(0.05);
  const tabsRef = useRef([]);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  const currentData = services.content[displayTab.toLowerCase()];

  const handleTabChange = (tab) => {
    if (tab === activeTab || isTransitioning) return;
    setActiveTab(tab);
    setIsTransitioning(true);
    setTimeout(() => {
      setDisplayTab(tab);
      setCardsRevealed(false);  // reset so new cards start in unrevealed state
      setIsTransitioning(false);
    }, 200);
  };

  // Trigger reveal on next frame after new cards have mounted
  useEffect(() => {
    if (!isTransitioning && isRevealed) {
      const raf = requestAnimationFrame(() => setCardsRevealed(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [displayTab, isTransitioning, isRevealed]);

  useEffect(() => {
    const updateSlider = () => {
      const activeIndex = services.tabs.indexOf(activeTab);
      const activeEl = tabsRef.current[activeIndex];
      if (activeEl) {
        setSliderStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    };

    // Use requestAnimationFrame to ensure the DOM elements are fully rendered and positioned
    const timer = requestAnimationFrame(updateSlider);
    window.addEventListener('resize', updateSlider);
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('resize', updateSlider);
    };
  }, [activeTab]);

  return (
    <Section id="services" borderBottom={false}>
      <SectionHeader
        index="01"
        tag="What i do"
        name="Services"
        title="Design systems for consistent, standout brands"
        subtitle="From the first pixel to the last commit — clear, cohesive, and impossible to ignore"
      />
      
      <div className="flex justify-end w-full max-w-[1600px] mb-8 pr-2">
        <div className="relative flex gap-2 bg-bg-card rounded-full p-1 border border-border/30">
          <div
            className="absolute top-1 bottom-1 bg-accent rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`,
            }}
          />
          {services.tabs.map((tab, idx) => (
            <button
              key={tab}
              ref={el => (tabsRef.current[idx] = el)}
              onClick={() => handleTabChange(tab)}
              className={`relative z-10 px-8 py-2.5 rounded-full text-[14px] uppercase tracking-tight transition-colors duration-300 ${
                activeTab === tab
                  ? 'text-bg-dark font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[30px] w-full max-w-[1600px]"
      >
        {currentData.items.map((item, index) => (
          <div
            key={`${displayTab}-${item.number}`}
            className={`bg-bg-card rounded-[30px] p-[40px] flex flex-col gap-6 text-left reveal-item ${cardsRevealed ? 'revealed' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-row items-center gap-[10px]">
              <div className="w-[40px] h-[40px] bg-accent rounded-[15px] flex items-center justify-center">
                <span className="font-mono text-[24px] font-normal text-bg-dark tracking-[-0.48px] uppercase">
                  {item.number}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[26px] font-medium text-[#F2F2F2] tracking-[-1.56px] leading-tight">{item.title}</h4>
              <p className="text-[16px] font-normal text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
