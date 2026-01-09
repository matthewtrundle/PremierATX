'use client';

import dynamic from 'next/dynamic';

const RentalsPage = dynamic(
  () => import('@/views/RentalsPage'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Loading vacation rentals...</div>
      </div>
    )
  }
);

export default function Rentals() {
  return <RentalsPage />;
}
