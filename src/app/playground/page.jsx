'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PlaygroundView = dynamic(
  () => import('../../components/Playground/PlaygroundView'),
  { ssr: false }
);

export default function Page() {
  return <PlaygroundView />;
}
