"use client";
import { useEffect, useRef } from 'react';
import Contact from '../components/Utils/Contact';
import ProjectCard from '../components/Utils/ProjectCard';
import { getImageUrl } from '../utils/image';
import { formatDate } from '../utils/date';
import { preventOrphans } from '../utils/text';

export default function ProjectDetail({ project, otherProjects = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project?.slug]);

  useEffect(() => {
    if (containerRef.current) {
      preventOrphans(containerRef.current);
    }
  }, [project?.content]);

  if (!project) {
    return null;
  }

  const coverImgUrl = getImageUrl(project.coverImage);

  return (
    <div ref={containerRef} className="pt-20 bg-bg-dark">

      {/* Header */}
      <section className="pt-[100px] pb-[60px] px-10 max-[810px]:pt-[60px] max-[810px]:px-5 max-w-[1200px] mx-auto border-b border-border">
        <div className={`flex flex-col gap-10 ${coverImgUrl ? 'lg:flex-row lg:items-center lg:justify-between' : ''}`}>
          
          {/* Left Column: Info */}
          <div className={`flex flex-col gap-8 ${coverImgUrl ? 'lg:w-[55%]' : 'w-full'}`}>
            <div className="flex flex-col gap-4 text-left">
              <span className="font-mono text-[0.95rem] text-accent">{formatDate(project.date)}</span>
              <h1 className="text-[3rem] md:text-[4rem] font-medium text-white tracking-[-0.04em] leading-[1.1]">
                {project.title}
              </h1>
              <p className="text-[1.35rem] text-text-secondary leading-[1.4]">
                {project.subtitle}
              </p>
            </div>

            {/* Meta block */}
            <div className="flex flex-col gap-[30px] mt-5 md:flex-row md:justify-between md:items-start text-left">
              {/* Tags */}
              <div className="flex flex-col gap-4 min-w-[200px]">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[0.85rem] text-text-muted uppercase">Client Location</span>
                  <span className="text-[1.1rem] font-medium text-white">{project.location}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[0.85rem] text-text-muted uppercase">Industry Focus</span>
                  <span className="text-[1.1rem] font-medium text-white">{project.industry}</span>
                </div>
              </div>

              {/* Testimonial */}
              {project.testimonial && project.testimonial.quote && (
                <div className="bg-bg-card border border-border p-[30px] rounded-[24px] flex-1 flex flex-col gap-4 max-w-[600px]">
                  <p className="text-[1.15rem] leading-[1.4] font-medium text-white">"{project.testimonial.quote}"</p>
                  <span className="font-mono text-[0.9rem] text-accent uppercase">
                    {project.testimonial.author}, {project.testimonial.company}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cover Image */}
          {coverImgUrl && (
            <div className="w-full lg:w-[40%] flex items-center justify-center">
              <div className="w-full aspect-[1.3] lg:aspect-square xl:aspect-[1.15] rounded-[30px] overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <img 
                  src={coverImgUrl} 
                  alt={`${project.title} Cover`} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Content body */}
      <section className="py-[80px] px-10 max-[810px]:py-[60px] max-[810px]:px-5 max-w-[1200px] mx-auto flex flex-col gap-10">
        
        {project.content && (
          <div 
            className="project-document-content text-left max-w-[900px] mr-auto"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        )}

        {/* Gallery */}
        <div className="flex flex-col gap-[60px] my-10">
          {project.gallery && project.gallery.map((item, idx) => {
            const imgUrl = getImageUrl(item.image);
            if (!imgUrl) return null;
            return (
              <div key={idx} className="flex flex-col gap-4 w-full">
                <div className="w-full rounded-[30px] overflow-hidden border border-border">
                  <img src={imgUrl} alt={`${project.title} Detail ${idx + 1}`} className="w-full" />
                </div>
                {item.caption && (
                  <span className="font-mono text-[0.9rem] text-text-muted uppercase tracking-[0.05em] pl-[10px]">
                    {item.caption}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* Other projects */}
      <section className="py-[100px] px-10 max-[810px]:py-[60px] max-[810px]:px-5 bg-bg-dark border-t border-b border-border flex flex-col items-center">
        <div className="text-center max-w-[800px] mb-[60px] flex flex-col items-center">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[0.9rem] text-accent opacity-80">02</span>
            <span className="font-mono text-[0.9rem] text-text-secondary opacity-50 uppercase">My work</span>
            <span className="font-mono text-[0.9rem] text-text-secondary opacity-50 uppercase">Portfolio</span>
          </div>
          <h2 className="text-[2.2rem] md:text-[3rem] font-medium tracking-[-0.04em] leading-[1.1] text-white mb-3">
            A Few Recent Projects Where Strategy Met Style
          </h2>
          <p className="text-[1.15rem] text-text-secondary mb-10">
            Built for brands that wanted more than just "nice"
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1600px]">
          {otherProjects.map((proj) => (
            <ProjectCard key={proj.slug} project={proj} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <Contact />
    </div>
  );
}
