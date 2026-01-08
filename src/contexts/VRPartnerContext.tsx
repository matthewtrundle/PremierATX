// VR Partner Context
// Provides current partner data throughout the app for multi-tenant support

import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { VRPartner, VRPartnerBrandingConfig } from '@/types/partyPlanning';
import { useVRPartnerBySlug } from '@/hooks/useVRPartners';
import {
  parseSubdomain,
  getPartnerSlugFromPath,
  getCurrentPartnerSlug,
  isPartnerStorefront,
  isDemoPartner,
} from '@/utils/subdomainRouter';

interface VRPartnerContextValue {
  // Partner data
  partner: VRPartner | null;
  partnerSlug: string | null;
  isLoading: boolean;
  error: Error | null;

  // Computed values
  isPartnerStorefront: boolean;
  isDemo: boolean;
  hasPartner: boolean;

  // Branding
  branding: VRPartnerBrandingConfig | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  tagline: string;
  logoUrl: string | null;

  // Utilities
  getPartnerPath: (path: string) => string;
}

const defaultBranding: VRPartnerBrandingConfig = {
  primary_color: '#6366f1', // Indigo
  secondary_color: '#ec4899', // Pink
  font_family: 'Inter',
  tagline: 'Plan Your Perfect Party',
  logo_position: 'left',
};

const defaultContextValue: VRPartnerContextValue = {
  partner: null,
  partnerSlug: null,
  isLoading: false,
  error: null,
  isPartnerStorefront: false,
  isDemo: false,
  hasPartner: false,
  branding: null,
  primaryColor: defaultBranding.primary_color,
  secondaryColor: defaultBranding.secondary_color,
  fontFamily: defaultBranding.font_family,
  tagline: defaultBranding.tagline,
  logoUrl: null,
  getPartnerPath: (path: string) => path,
};

const VRPartnerContext = createContext<VRPartnerContextValue>(defaultContextValue);

interface VRPartnerProviderProps {
  children: ReactNode;
  overrideSlug?: string; // For testing or manual override
}

export function VRPartnerProvider({ children, overrideSlug }: VRPartnerProviderProps) {
  const location = useLocation();

  // Determine partner slug from subdomain or path
  const partnerSlug = useMemo(() => {
    if (overrideSlug) return overrideSlug;

    // First check subdomain
    const subdomainInfo = parseSubdomain();
    if (subdomainInfo.partnerSlug) {
      return subdomainInfo.partnerSlug;
    }

    // Then check path (for development)
    return getPartnerSlugFromPath(location.pathname);
  }, [overrideSlug, location.pathname]);

  // Fetch partner data if we have a slug
  const {
    data: partner,
    isLoading,
    error,
  } = useVRPartnerBySlug(partnerSlug || undefined);

  // Apply partner branding as CSS variables
  useEffect(() => {
    const branding = partner?.branding_config || defaultBranding;

    document.documentElement.style.setProperty('--partner-primary', branding.primary_color);
    document.documentElement.style.setProperty('--partner-secondary', branding.secondary_color);
    document.documentElement.style.setProperty('--partner-font', branding.font_family);

    // Apply custom CSS if present
    if (branding.custom_css) {
      let styleEl = document.getElementById('partner-custom-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'partner-custom-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = branding.custom_css;
    }

    return () => {
      // Cleanup custom CSS on unmount or partner change
      const styleEl = document.getElementById('partner-custom-css');
      if (styleEl) {
        styleEl.textContent = '';
      }
    };
  }, [partner]);

  // Build context value
  const contextValue = useMemo<VRPartnerContextValue>(() => {
    const branding = partner?.branding_config || defaultBranding;
    const hasPartner = !!partner;
    const isStorefront = isPartnerStorefront();
    const isDemo = partnerSlug ? isDemoPartner(partnerSlug) : false;

    return {
      partner,
      partnerSlug,
      isLoading,
      error: error as Error | null,
      isPartnerStorefront: isStorefront,
      isDemo,
      hasPartner,
      branding,
      primaryColor: branding.primary_color,
      secondaryColor: branding.secondary_color,
      fontFamily: branding.font_family,
      tagline: branding.tagline,
      logoUrl: partner?.logo_url || null,
      getPartnerPath: (path: string) => {
        if (!partnerSlug) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `/partner/${partnerSlug}${cleanPath}`;
      },
    };
  }, [partner, partnerSlug, isLoading, error]);

  return (
    <VRPartnerContext.Provider value={contextValue}>
      {children}
    </VRPartnerContext.Provider>
  );
}

// Hook to use partner context
export function useVRPartnerContext() {
  const context = useContext(VRPartnerContext);
  if (!context) {
    throw new Error('useVRPartnerContext must be used within a VRPartnerProvider');
  }
  return context;
}

// Hook to require a partner (throws if not in a partner storefront)
export function useRequirePartner() {
  const context = useVRPartnerContext();

  if (!context.hasPartner && !context.isLoading) {
    throw new Error('This page requires a VR Partner context');
  }

  return context;
}

// Hook to get branding values
export function usePartnerBranding() {
  const { branding, primaryColor, secondaryColor, fontFamily, tagline, logoUrl } = useVRPartnerContext();
  return { branding, primaryColor, secondaryColor, fontFamily, tagline, logoUrl };
}

export default VRPartnerContext;
