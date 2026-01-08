'use client';

import dynamic from 'next/dynamic';

// Dynamically import concierge components
const ConciergeHome = dynamic(
  () => import('@/components/concierge/ConciergeHome').then(mod => ({ default: mod.ConciergeHome })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }
);

const Navigation = dynamic(
  () => import('@/components/concierge/Navigation').then(mod => ({ default: mod.Navigation })),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div>
      <ConciergeHome />
      <Navigation />
    </div>
  );
}
