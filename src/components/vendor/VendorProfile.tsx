// Vendor Profile - Airbnb Listing Style
// Full vendor page with image gallery, sticky booking sidebar, and packages

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendorWithPackages } from '@/hooks/useServiceVendors';
import { ServicePackage } from '@/types/partyPlanning';
import { calculatePackagePricing } from '@/hooks/useServicePackages';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { usePartyCart } from '@/hooks/usePartyCart';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { CartSheet, CartSummaryBar } from '@/components/cart/MultiVendorCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Star,
  MapPin,
  Clock,
  Users,
  Phone,
  Mail,
  Globe,
  ChevronLeft,
  Check,
  Loader2,
  Heart,
  Share,
  ChevronRight,
  X,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/party-design-tokens.css';

export function VendorProfile() {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const navigate = useNavigate();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();
  const { isCartOpen, closeCart, openCart, totals } = usePartyCart();

  // State
  const [guestCount, setGuestCount] = useState(10);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const bookingSidebarRef = useRef<HTMLDivElement>(null);

  // Fetch vendor with packages
  const { data: vendor, isLoading, error } = useVendorWithPackages(vendorSlug);

  // Collect all images
  const allImages = vendor ? [
    vendor.cover_image_url,
    vendor.logo_url,
    ...(vendor.packages?.flatMap(p => p.images || []) || [])
  ].filter(Boolean) as string[] : [];

  // Show mobile booking sheet when scrolling past packages
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setShowMobileBooking(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PartnerLayout>
        <div className="party-theme font-inter min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading vendor...</p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  // Error/not found state
  if (!vendor || error) {
    return (
      <PartnerLayout>
        <div className="party-theme font-inter min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
            <p className="text-gray-500 mb-6">We couldn't find the vendor you're looking for.</p>
            <Button onClick={() => navigate(getPartnerPath('/vendors'))}>
              Browse All Vendors
            </Button>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  const activePackages = vendor.packages?.filter(pkg => pkg.is_active)
    .sort((a, b) => a.display_order - b.display_order) || [];

  return (
    <PartnerLayout useNewNav showBottomNav>
      <div className="party-theme font-inter">
        {/* Back Navigation */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(getPartnerPath('/vendors'))}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Vendors
            </button>
          </div>
        </div>

        {/* Image Gallery Header */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden">
              {/* Main Image */}
              <div
                className="col-span-4 lg:col-span-2 aspect-[4/3] lg:aspect-[3/2] bg-gray-100 cursor-pointer relative group"
                onClick={() => { setGalleryIndex(0); setShowGallery(true); }}
              >
                {vendor.cover_image_url ? (
                  <img
                    src={vendor.cover_image_url}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)` }}
                  >
                    <span className="text-6xl font-bold opacity-30" style={{ color: primaryColor }}>
                      {vendor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Secondary Images (Desktop only) */}
              <div className="hidden lg:grid col-span-2 grid-cols-2 gap-2">
                {allImages.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="aspect-[3/2] bg-gray-100 cursor-pointer relative group"
                    onClick={() => { setGalleryIndex(i + 1); setShowGallery(true); }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {i === 3 && allImages.length > 5 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-semibold">+{allImages.length - 5} more</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-8 right-8 flex gap-2">
              <button
                onClick={() => navigator.share?.({ title: vendor.name, url: window.location.href })}
                className="p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Share className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Heart className={cn('w-4 h-4', isSaved ? 'fill-[#ff385c] text-[#ff385c]' : 'text-gray-700')} />
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Vendor Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Vendor Header */}
              <div className="pb-8 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="party-heading-1 text-gray-900 mb-2">{vendor.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {vendor.rating && (
                        <span className="flex items-center gap-1 font-medium">
                          <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                          {vendor.rating.toFixed(1)}
                          <span className="text-gray-500 font-normal">({vendor.review_count} reviews)</span>
                        </span>
                      )}
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vendor.service_area?.join(', ') || 'Austin'}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500 capitalize">{vendor.vendor_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {vendor.logo_url && (
                    <img
                      src={vendor.logo_url}
                      alt=""
                      className="w-16 h-16 rounded-xl object-contain bg-gray-50"
                    />
                  )}
                </div>

                {/* Featured Badge */}
                {vendor.is_featured && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700">Featured Vendor</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {vendor.description && (
                <div className="pb-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
                </div>
              )}

              {/* Group Discount Highlight */}
              {vendor.pricing_model === 'wholesale' && vendor.wholesale_discount_pct && (
                <div
                  className="p-6 rounded-xl border-2"
                  style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Users className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Group Discount Available</h3>
                      <p className="text-gray-600">
                        Book with your group and save up to <strong style={{ color: primaryColor }}>{vendor.wholesale_discount_pct}%</strong> off retail prices
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Packages Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Packages</h2>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="guests" className="text-sm text-gray-600">Guests:</Label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{guestCount}</span>
                      <button
                        onClick={() => setGuestCount(guestCount + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {activePackages.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No packages available at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activePackages.map((pkg) => {
                      const pricing = calculatePackagePricing(pkg, guestCount);
                      const isSelected = selectedPackage?.id === pkg.id;

                      return (
                        <div
                          key={pkg.id}
                          className={cn(
                            'p-6 rounded-xl border-2 cursor-pointer transition-all',
                            isSelected
                              ? 'shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                          style={isSelected ? { borderColor: primaryColor } : undefined}
                          onClick={() => setSelectedPackage(isSelected ? null : pkg)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">{pkg.name}</h3>
                                {pricing.savingsPercent > 0 && (
                                  <span
                                    className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    Save {pricing.savingsPercent}%
                                  </span>
                                )}
                              </div>
                              {pkg.description && (
                                <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                {pkg.duration_hours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {pkg.duration_hours} hours
                                  </span>
                                )}
                                {pkg.min_guests && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {pkg.min_guests}-{pkg.max_guests || '∞'} guests
                                  </span>
                                )}
                              </div>
                              {pkg.features && pkg.features.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {pkg.features.slice(0, 4).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 sm:pl-6">
                              {pricing.savingsPercent > 0 && (
                                <div className="text-sm text-gray-400 line-through">
                                  ${pricing.retailValue.toFixed(0)}
                                </div>
                              )}
                              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                                ${pricing.guestPays.toFixed(0)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pkg.price_type === 'per_person' && 'per person'}
                                {pkg.price_type === 'hourly' && 'per hour'}
                                {pkg.price_type === 'fixed' && 'total'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="pb-8 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vendor.contact_email && (
                    <a
                      href={`mailto:${vendor.contact_email}`}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{vendor.contact_email}</span>
                    </a>
                  )}
                  {vendor.contact_phone && (
                    <a
                      href={`tel:${vendor.contact_phone}`}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{vendor.contact_phone}</span>
                    </a>
                  )}
                  {vendor.website_url && (
                    <a
                      href={vendor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Globe className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">Visit Website</span>
                    </a>
                  )}
                  {vendor.business_address && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                      <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700">{vendor.business_address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Booking Sidebar (Desktop) */}
            <div className="hidden lg:block">
              <div
                ref={bookingSidebarRef}
                className="sticky top-24 p-6 bg-white border border-gray-200 rounded-xl shadow-lg"
              >
                {selectedPackage ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">Selected package</div>
                      <div className="font-semibold text-gray-900">{selectedPackage.name}</div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                        ${calculatePackagePricing(selectedPackage, guestCount).guestPays.toFixed(0)}
                      </span>
                      <span className="text-gray-500">
                        {selectedPackage.price_type === 'per_person' && `× ${guestCount} guests`}
                        {selectedPackage.price_type === 'hourly' && 'per hour'}
                      </span>
                    </div>
                    {selectedPackage.price_type === 'per_person' && (
                      <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Estimated total</span>
                          <span className="font-semibold text-gray-900">
                            ${(calculatePackagePricing(selectedPackage, guestCount).guestPays * guestCount).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    )}
                    <AddToCartButton
                      vendor={vendor}
                      package={selectedPackage}
                      fullWidth
                    />
                    <button
                      onClick={() => setSelectedPackage(null)}
                      className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Change package
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center text-gray-500 mb-4">
                      Select a package below to book
                    </div>
                    <Button
                      variant="outline"
                      className="w-full py-6"
                      onClick={() => document.querySelector('.space-y-4')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      View Packages
                    </Button>
                  </>
                )}
                <p className="text-center text-xs text-gray-400 mt-4">
                  You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Sticky Booking Bar */}
        <div
          className={cn(
            'lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 transition-transform duration-300',
            showMobileBooking && !isCartOpen ? 'translate-y-0' : 'translate-y-full'
          )}
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              {selectedPackage ? (
                <>
                  <div className="text-sm text-gray-500">{selectedPackage.name}</div>
                  <div className="font-bold text-lg" style={{ color: primaryColor }}>
                    ${calculatePackagePricing(selectedPackage, guestCount).guestPays.toFixed(0)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {selectedPackage.price_type === 'per_person' && 'per person'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">Select a package to book</div>
              )}
            </div>
            {selectedPackage ? (
              <AddToCartButton
                vendor={vendor}
                package={selectedPackage}
                className="px-8"
              />
            ) : (
              <Button
                className="px-8 py-3"
                style={{ backgroundColor: primaryColor }}
                disabled
              >
                Add to Party
              </Button>
            )}
          </div>
        </div>

        {/* Cart Summary Bar - shown when items in cart */}
        {totals.itemCount > 0 && !showMobileBooking && (
          <CartSummaryBar onClick={openCart} />
        )}

        {/* Cart Sheet */}
        <CartSheet isOpen={isCartOpen} onClose={closeCart} />

        {/* Image Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => setGalleryIndex((galleryIndex - 1 + allImages.length) % allImages.length)}
              className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <img
              src={allImages[galleryIndex]}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setGalleryIndex((galleryIndex + 1) % allImages.length)}
              className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-4 text-white text-sm">
              {galleryIndex + 1} / {allImages.length}
            </div>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}

export default VendorProfile;
