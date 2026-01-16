import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  // Get hostname for subdomain routing
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Extract subdomain (e.g., "partner" from "partner.premieratx.com")
  // In development, we use localhost which doesn't have subdomains
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  if (!isLocalhost) {
    const subdomain = hostname.split('.')[0];

    // Skip routing for known non-partner subdomains and the main app
    const systemSubdomains = ['www', 'admin', 'api', 'app', 'premier-atx'];

    // Also skip if this is a Vercel preview deployment (contains random hash)
    const isVercelPreview = hostname.includes('vercel.app') && subdomain.includes('-');

    if (subdomain && !systemSubdomains.includes(subdomain) && !isVercelPreview) {
      // This is a partner subdomain - rewrite to partner route
      // e.g., acme.premieratx.com -> /partner/acme
      url.pathname = `/partner/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url, response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
