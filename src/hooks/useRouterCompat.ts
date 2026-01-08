/**
 * Router compatibility layer for Next.js migration
 * Provides unified hooks that work with both React Router (Vite) and Next.js App Router
 */

// Detect if we're in a Next.js environment
const isNextJS = typeof window !== 'undefined' &&
  // Next.js injects __NEXT_DATA__ on the window
  (typeof (window as any).__NEXT_DATA__ !== 'undefined' ||
   // Or check for Next.js router in history state
   window.location.pathname.startsWith('/_next'));

// Try to import from next/navigation, fall back gracefully
let nextRouter: any = null;
let nextPathname: any = null;
let nextSearchParams: any = null;

if (isNextJS) {
  try {
    // Dynamic import doesn't work well here, so we use require
    const nextNavigation = require('next/navigation');
    nextRouter = nextNavigation.useRouter;
    nextPathname = nextNavigation.usePathname;
    nextSearchParams = nextNavigation.useSearchParams;
  } catch (e) {
    // Not in Next.js context
  }
}

// React Router imports (will be available in Vite)
import { useNavigate as useRRNavigate, useLocation as useRRLocation } from 'react-router-dom';

/**
 * Unified navigation hook
 * Returns a navigate function that works in both environments
 */
export function useNavigateCompat() {
  // Try Next.js router first if available
  if (nextRouter) {
    try {
      const router = nextRouter();
      return (path: string) => router.push(path);
    } catch (e) {
      // Not in Next.js context, fall through to React Router
    }
  }

  // Fall back to React Router
  try {
    const navigate = useRRNavigate();
    return navigate;
  } catch (e) {
    // No router available, return no-op
    console.warn('No router context available');
    return (path: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    };
  }
}

/**
 * Unified location hook
 * Returns location-like object with pathname and search
 */
export function useLocationCompat() {
  // Try Next.js hooks first
  if (nextPathname && nextSearchParams) {
    try {
      const pathname = nextPathname();
      const searchParams = nextSearchParams();
      return {
        pathname: pathname || '/',
        search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
        hash: typeof window !== 'undefined' ? window.location.hash : '',
      };
    } catch (e) {
      // Not in Next.js context
    }
  }

  // Fall back to React Router
  try {
    const location = useRRLocation();
    return {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };
  } catch (e) {
    // No router available, use window.location
    if (typeof window !== 'undefined') {
      return {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      };
    }
    return { pathname: '/', search: '', hash: '' };
  }
}
