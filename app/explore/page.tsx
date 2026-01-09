'use client';

import dynamic from 'next/dynamic';

const ExplorePage = dynamic(
  () => import('@/views/ExplorePage'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Loading experiences...</div>
      </div>
    )
  }
);

export default function Explore() {
  return <ExplorePage />;
}
