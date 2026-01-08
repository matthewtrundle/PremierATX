'use client';

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  children: ReactNode;
}

// Simplified providers for Next.js - cart and auth will be added gradually
export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
