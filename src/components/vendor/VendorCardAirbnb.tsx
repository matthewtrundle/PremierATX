// Vendor Card - Airbnb Style
// Photo-forward vendor card with 3:2 aspect ratio images

import React, { useState } from 'react';
import { ServiceVendor, VendorType } from '@/types/partyPlanning';
import { Star, Heart, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import '@/styles/party-design-tokens.css';

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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.();
  };

  return (
    <div
      className={cn(
        'party-theme group cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Image Container - 3:2 Aspect Ratio */}
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-gray-100">
        {/* Skeleton loader */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 party-skeleton" />
        )}

        {/* Main image */}
        {vendor.cover_image_url && !imageError ? (
          <img
            src={vendor.cover_image_url}
            alt={vendor.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
            }}
          >
            <span
              className="text-5xl font-bold opacity-30"
              style={{ color: primaryColor }}
            >
              {vendor.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Save/Heart button */}
        <button
          onClick={handleSaveClick}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
            'bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200',
            'shadow-sm z-10'
          )}
          aria-label={isSaved ? 'Remove from saved' : 'Save vendor'}
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-colors',
              isSaved ? 'fill-[#ff385c] text-[#ff385c]' : 'text-gray-700'
            )}
          />
        </button>

        {/* Featured badge */}
        {vendor.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-violet-300 to-amber-300 text-gray-900">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-3 space-y-1">
        {/* Name and Rating Row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-inter font-semibold text-[15px] text-gray-900 leading-tight line-clamp-1">
            {vendor.name}
          </h3>
          {vendor.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
              <span className="text-sm font-medium text-gray-900">
                {vendor.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Type and Location */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{typeConfig.label}</span>
          {vendor.service_area && vendor.service_area.length > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {vendor.service_area[0]}
              </span>
            </>
          )}
        </div>

        {/* Review count */}
        {vendor.review_count && vendor.review_count > 0 && (
          <p className="text-sm text-gray-500">
            {vendor.review_count} review{vendor.review_count !== 1 ? 's' : ''}
          </p>
        )}

        {/* Group discount badge */}
        {vendor.pricing_model === 'wholesale' && vendor.wholesale_discount_pct && (
          <div
            className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
            }}
          >
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
    <div className="party-theme">
      <div className="aspect-[3/2] rounded-xl party-skeleton" />
      <div className="pt-3 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-3/4 party-skeleton rounded" />
          <div className="h-4 w-8 party-skeleton rounded" />
        </div>
        <div className="h-3 w-1/2 party-skeleton rounded" />
        <div className="h-3 w-1/3 party-skeleton rounded" />
      </div>
    </div>
  );
}

export default VendorCardAirbnb;
