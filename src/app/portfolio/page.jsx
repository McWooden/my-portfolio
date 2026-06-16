import React from 'react';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../keystatic.config';
import Portfolio from '../../views/Portfolio';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const reader = createReader(process.cwd(), keystaticConfig);
  const projectsData = (await reader.collections.projects.all()).map(item => ({
    slug: item.slug,
    ...item.entry
  }));

  // Render the original Portfolio component with the dynamic data
  return <Portfolio projects={projectsData} />;
}
