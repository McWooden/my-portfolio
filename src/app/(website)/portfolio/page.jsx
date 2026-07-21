import React from 'react';
import Portfolio from '../../../views/Portfolio';
import { supabase, mapStory } from '../../../utils/supabase';

export const revalidate = 300;

export const metadata = {
  title: 'Portfolio',
  description: 'Lihat portfolio proyek Huddin — Brand Systems, UI/UX Design, Web & App Development dari Magelang, Jawa Tengah. Klien dari startup hingga brand besar.',
  openGraph: {
    title: 'Portfolio | Huddin - Magelang Developer',
    description: 'Koleksi proyek terbaik Huddin: Brand Systems, UI/UX Design, dan App Development dari Magelang.',
  },
  alternates: {
    canonical: '/portfolio',
  },
};

export default async function Page() {
  const { data: dbProjects, error } = await supabase
    .from('stories')
    .select('*, accounts(*)')
    .eq('published', true)
    .eq('type', 'project')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching projects from Supabase:', error);
  }

  const projectsData = (dbProjects || []).map(mapStory);

  // Render the original Portfolio component with the dynamic data
  return <Portfolio projects={projectsData} />;
}
