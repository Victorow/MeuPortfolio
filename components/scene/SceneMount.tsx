'use client';

import dynamic from 'next/dynamic';

const SpaceScene = dynamic(() => import('./SpaceScene'), {
  ssr: false,
  loading: () => null
});

export default function SceneMount() {
  return <SpaceScene />;
}
