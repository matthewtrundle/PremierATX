'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import for partner routes
const PartnerRoutes = dynamic(
  () => import('@/components/routing/PartnerRoutes').then(mod => ({ default: mod.PartnerRoutes })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Loading partner storefront...</div>
      </div>
    )
  }
);

export default function PartnerPage() {
  const params = useParams();
  const slug = params.slug as string;

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Partner not found</div>
      </div>
    );
  }

  return <PartnerRoutes partnerSlug={slug} />;
}
