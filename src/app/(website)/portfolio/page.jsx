import React from 'react';
import Portfolio from '../../../views/Portfolio';
import { supabase, mapStory } from '../../../utils/supabase';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { data: dbProjects, error } = await supabase
    .from('stories')
    .select('*')
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

