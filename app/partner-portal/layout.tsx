'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

interface PartnerPortalLayoutProps {
  children: ReactNode;
}

export default function PartnerPortalLayout({ children }: PartnerPortalLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-premier-mist">
        {children}
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            background: 'white',
            border: '1px solid rgba(0,0,0,0.1)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
