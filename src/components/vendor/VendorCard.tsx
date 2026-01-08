// Vendor Card Component
// Display card for vendor listings

import React from 'react';
import { ServiceVendor, VendorType } from '@/types/partyPlanning';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';

// Vendor type display config
const vendorTypeConfig: Record<VendorType, { label: string; color: string }> = {
  catering: { label: 'Catering', color: 'bg-orange-100 text-orange-700' },
  dj: { label: 'DJ', color: 'bg-purple-100 text-purple-700' },
  photography: { label: 'Photography', color: 'bg-blue-100 text-blue-700' },
  activities: { label: 'Activities', color: 'bg-green-100 text-green-700' },
  transportation: { label: 'Transportation', color: 'bg-cyan-100 text-cyan-700' },
  vr_rental: { label: 'VR Rental', color: 'bg-pink-100 text-pink-700' },
  spa: { label: 'Spa & Wellness', color: 'bg-rose-100 text-rose-700' },
  tours: { label: 'Tours', color: 'bg-amber-100 text-amber-700' },
  entertainment: { label: 'Entertainment', color: 'bg-violet-100 text-violet-700' },
  decor: { label: 'Decor', color: 'bg-teal-100 text-teal-700' },
};

interface VendorCardProps {
  vendor: ServiceVendor;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function VendorCard({ vendor, onClick, compact = false, className }: VendorCardProps) {
  const { primaryColor } = useVRPartnerContext();
  const typeConfig = vendorTypeConfig[vendor.vendor_type] || { label: vendor.vendor_type, color: 'bg-gray-100 text-gray-700' };

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-all hover:shadow-lg group',
        className
      )}
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {vendor.cover_image_url ? (
          <img
            src={vendor.cover_image_url}
            alt={vendor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
            }}
          >
            <span
              className="text-4xl font-bold opacity-30"
              style={{ color: primaryColor }}
            >
              {vendor.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {vendor.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-500 text-white">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Logo & Name */}
        <div className="flex items-start gap-3 mb-3">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt=""
              className="w-12 h-12 rounded-lg object-contain bg-gray-50"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {vendor.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{vendor.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{vendor.service_area?.join(', ') || 'Austin'}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {!compact && vendor.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {vendor.description}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">{vendor.rating?.toFixed(1) || '—'}</span>
            <span className="text-sm text-gray-500">
              ({vendor.review_count || 0} reviews)
            </span>
          </div>

          {/* Min Group Size */}
          {vendor.min_group_size && vendor.min_group_size > 1 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{vendor.min_group_size}+ guests</span>
            </div>
          )}
        </div>

        {/* Pricing Model Indicator */}
        {vendor.pricing_model === 'wholesale' && vendor.wholesale_discount_pct && (
          <div
            className="mt-3 px-3 py-2 rounded-lg text-sm font-medium text-center"
            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
          >
            Up to {vendor.wholesale_discount_pct}% group discount
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact variant for smaller displays
export function VendorCardCompact({ vendor, onClick }: VendorCardProps) {
  const { primaryColor } = useVRPartnerContext();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {vendor.logo_url ? (
        <img
          src={vendor.logo_url}
          alt=""
          className="w-12 h-12 rounded-lg object-contain bg-gray-50"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {vendor.name.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{vendor.name}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {vendor.rating?.toFixed(1) || '—'}
          </span>
          <span>•</span>
          <span className="capitalize">{vendor.vendor_type}</span>
        </div>
      </div>
    </div>
  );
}

export default VendorCard;
