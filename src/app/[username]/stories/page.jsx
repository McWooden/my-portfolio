'use client';

import React, { use } from 'react';
import StoriesDashboard from '../../../components/Stories/StoriesDashboard';

export default function UserStoriesPage({ params }) {
  const resolvedParams = use(params);
  return <StoriesDashboard username={resolvedParams.username} />;
}
