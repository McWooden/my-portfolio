import React from 'react';
import { notFound } from 'next/navigation';
import ProjectDetail from '../../../../views/ProjectDetail';
import { supabase, mapStory } from '../../../../utils/supabase';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: project, error } = await supabase
    .from('stories')
    .select('title, subtitle, cover_image, slug')
    .eq('slug', slug)
    .eq('type', 'project')
    .eq('published', true)
    .single();

  if (error || !project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: project.title,
    description: project.subtitle || `Detail proyek ${project.title} oleh Huddin — Full-Stack Developer & UI/UX Designer di Magelang.`,
    openGraph: {
      title: `${project.title} | Huddin Portfolio`,
      description: project.subtitle || `Detail proyek ${project.title} oleh Huddin.`,
      images: project.cover_image ? [{ url: project.cover_image, alt: project.title }] : [],
    },
    alternates: {
      canonical: `/portfolio/${slug}`,
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;

  // 1. Fetch current project
  const { data: currentDbProj, error: currentError } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .eq('type', 'project')
    .eq('published', true)
    .single();

  if (currentError || !currentDbProj) {
    notFound();
  }

  const projectWithSlug = mapStory(currentDbProj);

  // 2. Fetch other projects for recommendations
  const { data: allDbProjs, error: allProjsError } = await supabase
    .from('stories')
    .select('*')
    .eq('type', 'project')
    .eq('published', true)
    .order('date', { ascending: false });

  let otherProjects = [];
  if (!allProjsError && allDbProjs) {
    otherProjects = allDbProjs
      .map(mapStory)
      .filter(p => p.slug !== slug)
      .slice(0, 2);
  }

  return (
    <ProjectDetail 
      project={projectWithSlug} 
      otherProjects={otherProjects} 
    />
  );
}
