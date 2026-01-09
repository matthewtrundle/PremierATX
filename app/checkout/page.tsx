'use client';

import dynamic from 'next/dynamic';

// Dynamically import checkout to avoid SSR issues with localStorage, etc
const Checkout = dynamic(
  () => import('@/views/Checkout'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Loading checkout...</div>
      </div>
    )
  }
);

export default function CheckoutPage() {
  return <Checkout />;
}
