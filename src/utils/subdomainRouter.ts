// Subdomain Router Utility
// Handles parsing and routing for multi-tenant subdomain architecture
// Format: [partner-slug].partyplanwithus.com

export interface SubdomainInfo {
  subdomain: string | null;
  isPartnerSubdomain: boolean;
  partnerSlug: string | null;
  isDemo: boolean;
  baseDomain: string;
  fullHost: string;
}

// Known subdomains that are NOT partner slugs
const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'staging',
  'dev',
  'test',
  'mail',
  'smtp',
  'ftp',
  'cdn',
  'assets',
  'static',
  'docs',
  'help',
  'support',
  'status',
];

// Development domains where we use path-based routing instead
const DEV_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'lovableproject.com',
  'netlify.app',
  'vercel.app',
];

/**
 * Parse subdomain information from the current URL
 */
export function parseSubdomain(hostname: string = window.location.hostname): SubdomainInfo {
  const fullHost = hostname.toLowerCase();

  // Default result for no subdomain
  const defaultResult: SubdomainInfo = {
    subdomain: null,
    isPartnerSubdomain: false,
    partnerSlug: null,
    isDemo: false,
    baseDomain: fullHost,
    fullHost,
  };

  // Check if we're on a development domain (use path-based routing)
  const isDev = DEV_DOMAINS.some(domain => fullHost.includes(domain));
  if (isDev) {
    return defaultResult;
  }

  // Split hostname into parts
  const parts = fullHost.split('.');

  // Need at least 3 parts for a subdomain (sub.domain.tld)
  if (parts.length < 3) {
    return defaultResult;
  }

  // Extract subdomain (first part)
  const subdomain = parts[0];
  const baseDomain = parts.slice(1).join('.');

  // Check if it's a reserved subdomain
  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return {
      ...defaultResult,
      subdomain,
      baseDomain,
    };
  }

  // It's a partner subdomain!
  const isDemo = subdomain.startsWith('demo-');

  return {
    subdomain,
    isPartnerSubdomain: true,
    partnerSlug: subdomain,
    isDemo,
    baseDomain,
    fullHost,
  };
}

/**
 * Get partner slug from URL path (for development/fallback)
 * Path format: /partner/[slug]/...
 */
export function getPartnerSlugFromPath(pathname: string = window.location.pathname): string | null {
  const match = pathname.match(/^\/partner\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Get the current partner slug from either subdomain or path
 */
export function getCurrentPartnerSlug(): string | null {
  // First try subdomain
  const subdomainInfo = parseSubdomain();
  if (subdomainInfo.partnerSlug) {
    return subdomainInfo.partnerSlug;
  }

  // Fall back to path-based routing (for development)
  return getPartnerSlugFromPath();
}

/**
 * Build a URL for a specific partner's subdomain
 */
export function buildPartnerUrl(
  partnerSlug: string,
  path: string = '/',
  baseDomain: string = 'partyplanwithus.com'
): string {
  const protocol = window.location.protocol;
  return `${protocol}//${partnerSlug}.${baseDomain}${path}`;
}

/**
 * Build a path-based partner URL (for development)
 */
export function buildPartnerPath(partnerSlug: string, path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/partner/${partnerSlug}${cleanPath}`;
}

/**
 * Get the appropriate partner URL based on environment
 */
export function getPartnerUrl(
  partnerSlug: string,
  path: string = '/',
  options?: { forceSubdomain?: boolean }
): string {
  const subdomainInfo = parseSubdomain();

  // If we're on a development domain or not forcing subdomain, use path-based
  const isDev = DEV_DOMAINS.some(domain => subdomainInfo.fullHost.includes(domain));
  if (isDev && !options?.forceSubdomain) {
    return buildPartnerPath(partnerSlug, path);
  }

  // Use subdomain-based URL
  return buildPartnerUrl(partnerSlug, path, subdomainInfo.baseDomain);
}

/**
 * Navigate to a partner's storefront
 */
export function navigateToPartner(partnerSlug: string, path: string = '/'): void {
  const url = getPartnerUrl(partnerSlug, path);

  // If it's a full URL (with subdomain), do a full navigation
  if (url.startsWith('http')) {
    window.location.href = url;
  } else {
    // For path-based, use history API or React Router
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

/**
 * Check if the current URL is a partner storefront
 */
export function isPartnerStorefront(): boolean {
  const subdomainInfo = parseSubdomain();
  if (subdomainInfo.isPartnerSubdomain) {
    return true;
  }

  return getPartnerSlugFromPath() !== null;
}

/**
 * Get demo partner slugs for showcasing
 */
export function getDemoPartnerSlugs(): string[] {
  return ['demo-luxury', 'demo-lakehouse'];
}

/**
 * Check if a slug is a demo partner
 */
export function isDemoPartner(slug: string): boolean {
  return getDemoPartnerSlugs().includes(slug);
}
