'use client';

import dynamic from 'next/dynamic';

const ItineraryPage = dynamic(
  () => import('@/views/ItineraryPage'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Loading itinerary...</div>
      </div>
    )
  }
);

export default function Itinerary() {
  return <ItineraryPage />;
}
