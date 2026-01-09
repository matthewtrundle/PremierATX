// Vendor Card - Premium Style
// Photo-forward vendor card with clean, sophisticated design

import React, { useState } from 'react';
import { ServiceVendor, VendorType } from '@/types/partyPlanning';
import { Star, Heart, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';

// Vendor type display config
const vendorTypeConfig: Record<VendorType, { label: string }> = {
  catering: { label: 'Catering' },
  dj: { label: 'DJ' },
  photography: { label: 'Photography' },
  activities: { label: 'Activities' },
  transportation: { label: 'Transportation' },
  vr_rental: { label: 'VR Rental' },
  spa: { label: 'Spa & Wellness' },
  tours: { label: 'Tours' },
  entertainment: { label: 'Entertainment' },
  decor: { label: 'Decor' },
};

interface VendorCardAirbnbProps {
  vendor: ServiceVendor;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  className?: string;
}

export function VendorCardAirbnb({
  vendor,
  onClick,
  onSave,
  isSaved = false,
  className,
}: VendorCardAirbnbProps) {
  const { primaryColor } = useVRPartnerContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const typeConfig = vendorTypeConfig[vendor.vendor_type] || { label: vendor.vendor_type };

  // Use terracotta accent as default
  const accentColor = primaryColor || 'hsl(16, 65%, 50%)';

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.();
  };

  return (
    <div
      className={cn(
        'group cursor-pointer transition-all duration-300',
        'hover:-translate-y-1',
        className
      )}
      onClick={onClick}
    >
      {/* Image Container - 3:2 Aspect Ratio */}
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-premier-sand">
        {/* Skeleton loader */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-premier-sand animate-pulse" />
        )}

        {/* Main image */}
        {vendor.cover_image_url && !imageError ? (
          <img
            src={vendor.cover_image_url}
            alt={vendor.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-premier-sand">
            <span className="text-5xl font-display font-bold text-premier-sand-dark/40">
              {vendor.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Save/Heart button */}
        <button
          onClick={handleSaveClick}
          className={cn(
            'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center',
            'bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200',
            'shadow-md z-10'
          )}
          aria-label={isSaved ? 'Remove from saved' : 'Save vendor'}
        >
          <Heart
            className={cn(
              'w-4.5 h-4.5 transition-colors',
              isSaved ? 'fill-premier-accent text-premier-accent' : 'text-premier-ink-soft'
            )}
          />
        </button>

        {/* Featured badge */}
        {vendor.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-premier-sage text-white shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-4 space-y-1.5">
        {/* Name and Rating Row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-base text-premier-ink leading-tight line-clamp-1">
            {vendor.name}
          </h3>
          {vendor.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-premier-accent text-premier-accent" />
              <span className="text-sm font-medium text-premier-ink">
                {vendor.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Type and Location */}
        <div className="flex items-center gap-2 text-sm text-premier-ink-soft">
          <span>{typeConfig.label}</span>
          {vendor.service_area && vendor.service_area.length > 0 && (
            <>
              <span className="text-premier-sand-dark">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {vendor.service_area[0]}
              </span>
            </>
          )}
        </div>

        {/* Review count */}
        {vendor.review_count && vendor.review_count > 0 && (
          <p className="text-sm text-premier-ink-soft">
            {vendor.review_count} review{vendor.review_count !== 1 ? 's' : ''}
          </p>
        )}

        {/* Group discount badge */}
        {vendor.pricing_model === 'wholesale' && vendor.wholesale_discount_pct && (
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-premier-sage-soft/30 text-premier-sage border border-premier-sage/20">
            <span>Up to {vendor.wholesale_discount_pct}% group discount</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton loading version
export function VendorCardAirbnbSkeleton() {
  return (
    <div>
      <div className="aspect-[3/2] rounded-2xl bg-premier-sand animate-pulse" />
      <div className="pt-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-3/4 bg-premier-sand rounded animate-pulse" />
          <div className="h-4 w-8 bg-premier-sand rounded animate-pulse" />
        </div>
        <div className="h-3 w-1/2 bg-premier-sand rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-premier-sand rounded animate-pulse" />
      </div>
    </div>
  );
}

export default VendorCardAirbnb;
