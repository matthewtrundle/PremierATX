// Partner Storefront - Airbnb Inspired
// Full-bleed hero with search, category pills, and featured vendors

import React, { useState } from 'react';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { useNavigate } from 'react-router-dom';
import { useServiceVendors } from '@/hooks/useServiceVendors';
import { VendorCardAirbnb, VendorCardAirbnbSkeleton } from '@/components/vendor/VendorCardAirbnb';
import { AIPlannerChat, AIPlannerFAB } from '@/components/ai';
import {
  Search,
  Sparkles,
  ChefHat,
  Music,
  Camera,
  Car,
  Anchor,
  PartyPopper,
  MapPin,
  Star,
  Shield,
  Calendar,
  Users,
  ArrowRight,
  Flower2 as Spa,
  Map as Compass,
  Paintbrush as Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/party-design-tokens.css';

// Vendor category config with icons
const categories = [
  { type: 'all', icon: Sparkles, label: 'All' },
  { type: 'catering', icon: ChefHat, label: 'Catering' },
  { type: 'dj', icon: Music, label: 'DJs' },
  { type: 'entertainment', icon: PartyPopper, label: 'Entertainment' },
  { type: 'photography', icon: Camera, label: 'Photography' },
  { type: 'transportation', icon: Car, label: 'Transportation' },
  { type: 'activities', icon: Anchor, label: 'Activities' },
  { type: 'spa', icon: Spa, label: 'Spa' },
  { type: 'tours', icon: Compass, label: 'Tours' },
  { type: 'decor', icon: Palette, label: 'Decor' },
];

export function PartnerStorefront() {
  const { partner, branding, isDemo, primaryColor, secondaryColor, tagline, getPartnerPath } = useVRPartnerContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAIChat, setShowAIChat] = useState(false);

  // Fetch featured vendors
  const { data: featuredVendors, isLoading: loadingFeatured } = useServiceVendors({
    activeOnly: true,
    featuredOnly: true,
  });

  // Fetch all vendors for display
  const { data: allVendors, isLoading: loadingAll } = useServiceVendors({
    activeOnly: true,
    vendorType: activeCategory !== 'all' ? activeCategory as any : undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(getPartnerPath(`/vendors?search=${encodeURIComponent(searchQuery)}`));
    }
  };

  const handleCategoryClick = (type: string) => {
    setActiveCategory(type);
    if (type !== 'all') {
      navigate(getPartnerPath(`/vendors?type=${type}`));
    }
  };

  const handleVendorClick = (vendorSlug: string) => {
    navigate(getPartnerPath(`/vendor/${vendorSlug}`));
  };

  const handleBrowseAll = () => {
    navigate(getPartnerPath('/vendors'));
  };

  const handleStartPlanning = () => {
    navigate(getPartnerPath('/plan'));
  };

  // Default hero image fallback
  const heroImage = branding?.hero_image || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&q=80';

  return (
    <PartnerLayout useNewNav showHeader={false} showBottomNav>
      <div className="party-theme font-inter">
        {/* Hero Section - Full Bleed */}
        <section className="relative min-h-[500px] lg:min-h-[600px] flex items-end overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full pb-12 lg:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Demo Badge */}
              {isDemo && (
                <div className="inline-flex items-center px-3 py-1.5 bg-amber-500/90 text-white text-sm font-medium rounded-full mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Demo Storefront
                </div>
              )}

              {/* Main Headline */}
              <h1 className="party-heading-hero text-white mb-4 max-w-3xl">
                {tagline || 'Plan Your Perfect Austin Party'}
              </h1>

              <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl">
                Connect with Austin's top vendors for bachelor, bachelorette, and celebration parties.
                Exclusive group discounts on every booking.
              </p>

              {/* Search Bar - Airbnb Style */}
              <form onSubmit={handleSearch} className="max-w-2xl">
                <div className="relative flex items-center bg-white rounded-full shadow-lg overflow-hidden">
                  <div className="flex-1 flex items-center">
                    <Search className="w-5 h-5 text-gray-400 ml-6" />
                    <input
                      type="text"
                      placeholder="Search vendors, activities, or services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-4 lg:py-5 text-base lg:text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="m-2 px-6 py-3 rounded-full text-white font-semibold transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="hidden sm:inline">Search</span>
                    <Search className="w-5 h-5 sm:hidden" />
                  </button>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { icon: Star, text: '4.9 average rating' },
                  { icon: Users, text: '50+ group parties' },
                  { icon: Shield, text: 'Secure booking' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                    <stat.icon className="w-4 h-4" />
                    <span>{stat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills - Horizontal Scroll */}
        <section className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {categories.map((cat) => (
                  <button
                    key={cat.type}
                    onClick={() => handleCategoryClick(cat.type)}
                    className={cn(
                      'party-pill flex items-center gap-2 whitespace-nowrap transition-all',
                      activeCategory === cat.type
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'hover:border-gray-400'
                    )}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vendors Section */}
        {(loadingFeatured || (featuredVendors && featuredVendors.length > 0)) && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="party-heading-2 text-gray-900 flex items-center gap-2">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    Featured Vendors
                  </h2>
                  <p className="text-gray-500 mt-1">Top-rated vendors with exclusive group discounts</p>
                </div>
                <button
                  onClick={handleBrowseAll}
                  className="hidden sm:flex items-center gap-2 text-gray-900 font-semibold hover:underline"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Vendor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingFeatured ? (
                  // Skeleton loaders
                  Array.from({ length: 4 }).map((_, i) => (
                    <VendorCardAirbnbSkeleton key={i} />
                  ))
                ) : (
                  featuredVendors?.slice(0, 4).map((vendor) => (
                    <VendorCardAirbnb
                      key={vendor.id}
                      vendor={vendor}
                      onClick={() => handleVendorClick(vendor.slug)}
                    />
                  ))
                )}
              </div>

              {/* Mobile "View All" button */}
              <div className="mt-6 sm:hidden">
                <button
                  onClick={handleBrowseAll}
                  className="w-full py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  View all vendors
                </button>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="party-heading-2 text-gray-900 mb-3">How It Works</h2>
              <p className="text-gray-500 text-lg">Plan your perfect party in three simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  icon: Calendar,
                  title: 'Tell Us About Your Party',
                  description: 'Share your date, guest count, and preferences. Our AI assistant helps you every step.',
                },
                {
                  step: '2',
                  icon: Search,
                  title: 'Browse & Book Vendors',
                  description: 'Explore curated vendors with exclusive group discounts. Compare and build your lineup.',
                },
                {
                  step: '3',
                  icon: PartyPopper,
                  title: 'Enjoy Your Celebration',
                  description: 'We handle coordination so you can focus on memories. Split costs easily with your group.',
                },
              ].map((item, i) => (
                <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm">
                  <div
                    className="absolute -top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {item.step}
                  </div>
                  <item.icon
                    className="w-10 h-10 mb-4"
                    style={{ color: primaryColor }}
                  />
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Vendors Preview */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="party-heading-2 text-gray-900">Explore Vendors</h2>
                <p className="text-gray-500 mt-1">Browse all available vendors in Austin</p>
              </div>
              <button
                onClick={handleBrowseAll}
                className="hidden sm:flex items-center gap-2 text-gray-900 font-semibold hover:underline"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingAll ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <VendorCardAirbnbSkeleton key={i} />
                ))
              ) : (
                allVendors?.slice(0, 8).map((vendor) => (
                  <VendorCardAirbnb
                    key={vendor.id}
                    vendor={vendor}
                    onClick={() => handleVendorClick(vendor.slug)}
                  />
                ))
              )}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleBrowseAll}
                className="inline-flex items-center gap-2 px-8 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Show all {allVendors?.length || 0}+ vendors
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-20"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor})`,
          }}
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Sparkles className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="party-heading-1 text-white mb-4">
              Ready to Plan Your Party?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Let our AI assistant help you create the perfect celebration.
              It's free to start planning!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartPlanning}
                className="party-btn bg-white text-gray-900 hover:bg-gray-100"
              >
                <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                Start Planning with AI
              </button>
              <button
                onClick={handleBrowseAll}
                className="party-btn bg-transparent text-white border-2 border-white/50 hover:bg-white/10"
              >
                Browse Vendors
              </button>
            </div>
          </div>
        </section>

        {/* Trust Signals Footer */}
        <section className="py-8 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
              {[
                { icon: Shield, text: 'Secure Payments' },
                { icon: Star, text: 'Verified Vendors' },
                { icon: Users, text: 'Group Discounts' },
                { icon: MapPin, text: 'Austin Local' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Planner FAB */}
        {!showAIChat && (
          <AIPlannerFAB onClick={() => setShowAIChat(true)} />
        )}

        {/* AI Planner Chat Panel */}
        <AIPlannerChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      </div>
    </PartnerLayout>
  );
}

export default PartnerStorefront;
