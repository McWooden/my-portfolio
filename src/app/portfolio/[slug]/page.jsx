import React from 'react';
import { notFound } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../../keystatic.config';
import ProjectDetail from '../../../views/ProjectDetail';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const { slug } = await params;
  const reader = createReader(process.cwd(), keystaticConfig);
  const project = await reader.collections.projects.read(slug);

  if (!project) {
    notFound();
  }

  const allProjects = (await reader.collections.projects.all()).map(item => ({
    slug: item.slug,
    ...item.entry
  }));

  const projectWithSlug = {
    slug,
    ...project
  };

  const otherProjects = allProjects.filter(p => p.slug !== slug).slice(0, 2);

  return (
    <ProjectDetail 
      project={projectWithSlug} 
      otherProjects={otherProjects} 
    />
  );
}
