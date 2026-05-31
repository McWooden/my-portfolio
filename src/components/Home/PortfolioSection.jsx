import React from 'react';
import { projects } from '../../data/siteData';
import ProjectCard from '../Utils/ProjectCard';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function PortfolioSection() {
  const featuredProjects = projects.filter(p => p.featured);
  const [gridRef, isRevealed] = useScrollReveal(0.05);

  return (
    <Section id="portfolio">
      <SectionHeader
        index="02"
        tag="My work"
        name="Portfolio"
        title="A Few Recent Projects I'm Proud Of Creating"
        subtitle={'Built for brands that wanted more than just "nice"'}
      />
      <div 
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1600px]"
      >
        {featuredProjects.map((project, index) => (
          <ProjectCard 
            key={project.slug} 
            project={project} 
            className={`reveal-item ${isRevealed ? 'revealed' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </Section>
  );
}
