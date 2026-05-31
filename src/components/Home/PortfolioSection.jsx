import React from 'react';
import { projects } from '../../data/siteData';
import ProjectCard from '../Utils/ProjectCard';
import SectionHeader from '../Utils/SectionHeader';
import Section from '../Utils/Section';

export default function PortfolioSection() {
  const featuredProjects = projects.filter(p => p.featured);

  return (
    <Section id="portfolio">
      <SectionHeader
        index="02"
        tag="My work"
        name="Portfolio"
        title="A Few Recent Projects I'm Proud Of Creating"
        subtitle={'Built for brands that wanted more than just "nice"'}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1600px]">
        {featuredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  );
}
