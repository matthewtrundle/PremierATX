// Partner Layout
// Wrapper component for VR Partner storefronts with branding

import React, { ReactNode } from 'react';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopNav, BottomNav, PartyFAB } from '@/components/navigation';
import '@/styles/party-design-tokens.css';

interface PartnerLayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  hideDefaultNav?: boolean; // Hide the default sticky header (for pages with their own nav)
  useNewNav?: boolean; // Use new Airbnb-style navigation
  showBottomNav?: boolean; // Show mobile bottom nav
  showPartyFAB?: boolean; // Show floating party button
  partyItemCount?: number; // Number of items in party (for FAB badge)
  partyTotal?: number; // Total party cost (for FAB display)
  transparentHeader?: boolean; // For hero overlay navigation
}

export function PartnerLayout({
  children,
  className,
  showHeader = true,
  showFooter = true,
  hideDefaultNav = false,
  useNewNav = false,
  showBottomNav = true,
  showPartyFAB = false,
  partyItemCount = 0,
  partyTotal,
  transparentHeader = false,
}: PartnerLayoutProps) {
  const { partner, isLoading, error, hasPartner, branding, logoUrl, getPartnerPath } = useVRPartnerContext();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Partner not found
  if (!hasPartner || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the vacation rental partner you're looking for.
            Please check the URL and try again.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Use new Airbnb-style navigation
  if (useNewNav) {
    return (
      <div
        className={cn('min-h-screen flex flex-col party-theme', className)}
        style={{
          fontFamily: branding?.font_family || 'Inter',
        }}
      >
        {/* New Top Navigation */}
        {showHeader && (
          <TopNav
            transparent={transparentHeader}
            cartItemCount={partyItemCount}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1',
          showBottomNav && 'has-bottom-nav lg:pb-0'
        )}>
          {children}
        </main>

        {/* Partner Footer */}
        {showFooter && (
          <footer className={cn(
            'bg-gray-900 text-gray-300',
            showBottomNav && 'mb-16 lg:mb-0'
          )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Partner Info */}
                <div className="col-span-1 md:col-span-2">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={partner?.name || 'Partner Logo'}
                      className="h-8 w-auto mb-4 brightness-0 invert opacity-80"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white mb-4 block">
                      {partner?.name}
                    </span>
                  )}
                  <p className="text-gray-400 max-w-md">
                    {branding?.description || branding?.tagline || 'Your premier party planning destination.'}
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                    <li><a href={getPartnerPath('/plan')} className="hover:text-white transition-colors">Plan a Party</a></li>
                    <li><a href={getPartnerPath('/vendors')} className="hover:text-white transition-colors">Browse Vendors</a></li>
                    <li><a href={getPartnerPath('/faq')} className="hover:text-white transition-colors">FAQ</a></li>
                    <li><a href={getPartnerPath('/contact')} className="hover:text-white transition-colors">Contact</a></li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Contact</h4>
                  <ul className="space-y-2">
                    {partner?.email && (
                      <li>
                        <a href={`mailto:${partner.email}`} className="hover:text-white transition-colors">
                          {partner.email}
                        </a>
                      </li>
                    )}
                    {partner?.phone && (
                      <li>
                        <a href={`tel:${partner.phone}`} className="hover:text-white transition-colors">
                          {partner.phone}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
                <p className="text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} {partner?.name}. All rights reserved.
                </p>
                <p className="text-sm text-gray-500 mt-2 md:mt-0">
                  Powered by{' '}
                  <a href="https://partyplanwithus.com" className="text-indigo-400 hover:text-indigo-300">
                    Party Plan With Us
                  </a>
                </p>
              </div>
            </div>
          </footer>
        )}

        {/* Mobile Bottom Navigation */}
        {showBottomNav && <BottomNav />}

        {/* Party FAB */}
        {showPartyFAB && partyItemCount > 0 && (
          <PartyFAB
            itemCount={partyItemCount}
            totalPrice={partyTotal}
          />
        )}
      </div>
    );
  }

  // Original layout (for backward compatibility)
  return (
    <div
      className={cn('min-h-screen flex flex-col', className)}
      style={{
        fontFamily: branding?.font_family || 'Inter',
      }}
    >
      {/* Partner Header */}
      {showHeader && !hideDefaultNav && (
        <header
          className="bg-white border-b border-gray-200 sticky top-0 z-50"
          style={{
            borderBottomColor: branding?.primary_color ? `${branding.primary_color}20` : undefined,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className={cn(
                'flex items-center',
                branding?.logo_position === 'center' && 'justify-center flex-1',
                branding?.logo_position === 'right' && 'order-last',
              )}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={partner?.name || 'Partner Logo'}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span
                    className="text-xl font-bold"
                    style={{ color: branding?.primary_color }}
                  >
                    {partner?.name}
                  </span>
                )}
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a
                  href={getPartnerPath('/plan')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Plan Party
                </a>
                <a
                  href={getPartnerPath('/vendors')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Browse Vendors
                </a>
                <a
                  href={getPartnerPath('/my-parties')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  My Parties
                </a>
              </nav>

              {/* CTA Button */}
              <button
                className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                style={{
                  backgroundColor: branding?.primary_color,
                }}
              >
                Start Planning
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Partner Footer */}
      {showFooter && (
        <footer className="bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Partner Info */}
              <div className="col-span-1 md:col-span-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={partner?.name || 'Partner Logo'}
                    className="h-8 w-auto mb-4 brightness-0 invert opacity-80"
                  />
                ) : (
                  <span className="text-xl font-bold text-white mb-4 block">
                    {partner?.name}
                  </span>
                )}
                <p className="text-gray-400 max-w-md">
                  {branding?.description || branding?.tagline || 'Your premier party planning destination.'}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href={getPartnerPath('/plan')} className="hover:text-white transition-colors">Plan a Party</a></li>
                  <li><a href={getPartnerPath('/vendors')} className="hover:text-white transition-colors">Browse Vendors</a></li>
                  <li><a href={getPartnerPath('/faq')} className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href={getPartnerPath('/contact')} className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <ul className="space-y-2">
                  {partner?.email && (
                    <li>
                      <a href={`mailto:${partner.email}`} className="hover:text-white transition-colors">
                        {partner.email}
                      </a>
                    </li>
                  )}
                  {partner?.phone && (
                    <li>
                      <a href={`tel:${partner.phone}`} className="hover:text-white transition-colors">
                        {partner.phone}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} {partner?.name}. All rights reserved.
              </p>
              <p className="text-sm text-gray-500 mt-2 md:mt-0">
                Powered by{' '}
                <a href="https://partyplanwithus.com" className="text-indigo-400 hover:text-indigo-300">
                  Party Plan With Us
                </a>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default PartnerLayout;
