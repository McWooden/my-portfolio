import React from 'react';
import { Link } from 'react-router-dom';

export const ProjectCard = ({ project }) => (
  <Link
    to={`/portfolio/${project.slug}`}
    className="flex flex-col gap-4 group text-left w-full"
  >
    {/* Rounded cover image container with no border or background */}
    <div className="w-full aspect-[1.6] overflow-hidden rounded-[30px]">
      <img
        src={project.coverImage}
        alt={project.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
      />
    </div>
    
    {/* Info area aligned cleanly under the image */}
    <div className="px-2 flex justify-between items-start">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[1.5rem] md:text-[1.8rem] font-medium text-white tracking-[-0.04em]">
          {project.title}
        </h3>
        <span className="font-sans text-[0.95rem] text-text-secondary">
          {project.location}
        </span>
      </div>
      
      {/* Category / Industry pill */}
      <div className="font-mono text-[0.75rem] md:text-[0.85rem] uppercase text-text-secondary border border-white/20 px-[14px] py-[6px] rounded-full">
        {project.industry}
      </div>
    </div>
  </Link>
);

export default ProjectCard;
