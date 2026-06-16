"use client";
import React from 'react';
import { projects as staticProjects } from '../data/siteData';
import Ticker from '../components/Utils/Ticker';
import FAQ from '../components/Utils/FAQ';
import Contact from '../components/Utils/Contact';
import SectionHeader from '../components/Utils/SectionHeader';
import ProjectCard from '../components/Utils/ProjectCard';
import Section from '../components/Utils/Section';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Portfolio({ projects = staticProjects }) {
  const [gridRef, isRevealed] = useScrollReveal(0.05);

  return (
    <div className="pt-[140px] max-[810px]:pt-[100px] bg-bg-dark">
      
      {/* 1. Page Section Header */}
      <div className="w-full max-w-[1600px] mx-auto px-5 xl:px-10 mb-[60px]">
        <SectionHeader
          index="01"
          tag="My work"
          name="Portfolio"
          title="A Few Recent Projects I'm Proud Of Creating"
          subtitle={'Built for brands that wanted more than just "nice"'}
        />
      </div>

      {/* 2. Projects Grid Section */}
      <Section id="portfolio-grid" extraClass="py-0">
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full"
        >
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.slug} 
              project={project} 
              className={`reveal-item ${isRevealed ? 'revealed' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </Section>

      {/* 3. Ticker */}
      <Ticker />

      {/* 4. FAQ */}
      <FAQ labelIndex="02" />

      {/* 5. Contact */}
      <Contact />
    </div>
  );
}
