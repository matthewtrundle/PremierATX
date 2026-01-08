// Vendor Browser Component - Airbnb Style
// Browse and filter vendors by type with photo-forward cards

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServiceVendors, useSearchVendors } from '@/hooks/useServiceVendors';
import { VendorType } from '@/types/partyPlanning';
import { VendorCardAirbnb, VendorCardAirbnbSkeleton } from './VendorCardAirbnb';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import {
  Search,
  ChefHat,
  Music,
  Camera,
  Car,
  Anchor,
  PartyPopper,
  Sparkles,
  Star,
  X,
  Flower2 as Spa,
  Map as Compass,
  Paintbrush as Palette,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/party-design-tokens.css';

// Vendor type config with icons
const vendorTypeFilters: { type: VendorType | 'all'; label: string; icon: React.ElementType }[] = [
  { type: 'all', label: 'All', icon: Sparkles },
  { type: 'catering', label: 'Catering', icon: ChefHat },
  { type: 'dj', label: 'DJs', icon: Music },
  { type: 'entertainment', label: 'Entertainment', icon: PartyPopper },
  { type: 'photography', label: 'Photography', icon: Camera },
  { type: 'transportation', label: 'Transportation', icon: Car },
  { type: 'activities', label: 'Activities', icon: Anchor },
  { type: 'spa', label: 'Spa', icon: Spa },
  { type: 'tours', label: 'Tours', icon: Compass },
  { type: 'decor', label: 'Decor', icon: Palette },
];

export function VendorBrowser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const activeType = (searchParams.get('type') as VendorType | null) || 'all';
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Fetch vendors
  const { data: vendors, isLoading } = useServiceVendors({
    activeOnly: true,
    vendorType: activeType !== 'all' ? activeType as VendorType : undefined,
    featuredOnly: showFeaturedOnly || undefined,
  });

  // Search vendors
  const { data: searchResults, isLoading: isSearching } = useSearchVendors(
    searchQuery,
    { vendorType: activeType !== 'all' ? activeType as VendorType : undefined }
  );

  // Determine which vendors to display
  const displayVendors = useMemo(() => {
    if (searchQuery.length >= 2) {
      return searchResults || [];
    }
    return vendors || [];
  }, [searchQuery, searchResults, vendors]);

  // Featured vendors (always show at top)
  const featuredVendors = useMemo(() => {
    if (showFeaturedOnly) return [];
    return displayVendors.filter(v => v.is_featured);
  }, [displayVendors, showFeaturedOnly]);

  const regularVendors = useMemo(() => {
    if (showFeaturedOnly) return displayVendors;
    return displayVendors.filter(v => !v.is_featured);
  }, [displayVendors, showFeaturedOnly]);

  // Handle type filter change
  const handleTypeChange = (type: string) => {
    if (type === 'all') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', type);
    }
    setSearchParams(searchParams);
  };

  // Navigate to vendor profile
  const handleVendorClick = (vendorSlug: string) => {
    navigate(getPartnerPath(`/vendor/${vendorSlug}`));
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery);
      setSearchParams(searchParams);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <PartnerLayout useNewNav showBottomNav>
      <div className="party-theme">
        {/* Sticky Filter Bar */}
        <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar - Mobile */}
            <div className="py-3 lg:hidden">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </form>
            </div>

            {/* Category Pills - Horizontal Scroll */}
            <div className="py-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                {vendorTypeFilters.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={cn(
                      'party-pill flex items-center gap-2 whitespace-nowrap transition-all',
                      activeType === type
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'hover:border-gray-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}

                {/* Filter Button */}
                <button
                  onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  className={cn(
                    'party-pill flex items-center gap-2 whitespace-nowrap ml-2',
                    showFeaturedOnly
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'hover:border-gray-400'
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeType === 'all' ? 'All Vendors' : vendorTypeFilters.find(v => v.type === activeType)?.label}
              </h1>
              <p className="text-gray-500 mt-1">
                {displayVendors.length} vendor{displayVendors.length !== 1 ? 's' : ''} in Austin
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-12 pr-12 py-3 border border-gray-200 rounded-full text-base focus:outline-none focus:border-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isSearching) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <VendorCardAirbnbSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isSearching && displayVendors.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery
                ? `No vendors match "${searchQuery}". Try a different search term.`
                : 'No vendors available in this category yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Featured Vendors Section */}
        {featuredVendors.length > 0 && !showFeaturedOnly && !isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Featured Vendors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredVendors.map((vendor) => (
                <VendorCardAirbnb
                  key={vendor.id}
                  vendor={vendor}
                  onClick={() => handleVendorClick(vendor.slug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Vendors Grid */}
        {regularVendors.length > 0 && !isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {featuredVendors.length > 0 && !showFeaturedOnly && (
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                All Vendors
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularVendors.map((vendor) => (
                <VendorCardAirbnb
                  key={vendor.id}
                  vendor={vendor}
                  onClick={() => handleVendorClick(vendor.slug)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}

export default VendorBrowser;
