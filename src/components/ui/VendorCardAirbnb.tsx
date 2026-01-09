'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorCardAirbnbProps {
  id: string;
  name: string;
  category: string;
  images: string[];
  price: number;
  priceUnit?: string;
  rating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
  badge?: string;
  href?: string;
  onFavoriteClick?: (id: string) => void;
  onAddToParty?: (id: string) => void;
}

export function VendorCardAirbnb({
  id,
  name,
  category,
  images,
  price,
  priceUnit = 'person',
  rating,
  reviewCount,
  isFavorite = false,
  badge,
  href,
  onFavoriteClick,
  onAddToParty,
}: VendorCardAirbnbProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    onFavoriteClick?.(id);
  };

  const CardWrapper = href ? Link : 'div';
  const cardProps = href ? { href } : {};

  return (
    <CardWrapper
      {...cardProps}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        {/* Images */}
        {images.length > 0 ? (
          <Image
            src={images[currentImageIndex]}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 z-10 p-2 rounded-full transition-transform hover:scale-110"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn(
              'w-6 h-6 transition-colors',
              favorite
                ? 'fill-red-500 text-red-500'
                : 'fill-black/50 text-white stroke-[1.5]'
            )}
          />
        </button>

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-white rounded-full text-xs font-semibold text-gray-900 shadow-sm">
            {badge}
          </div>
        )}

        {/* Image Navigation Arrows (show on hover) */}
        {images.length > 1 && isHovered && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform opacity-90 hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform opacity-90 hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  idx === currentImageIndex
                    ? 'bg-white scale-100'
                    : 'bg-white/60 scale-75'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        {/* Top row: Name and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] text-gray-900 leading-tight line-clamp-1">
            {name}
          </h3>
          {rating !== undefined && rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-current text-gray-900" />
              <span className="text-sm text-gray-900">{rating.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Category */}
        <p className="text-[15px] text-gray-500 mt-0.5">{category}</p>

        {/* Price */}
        <p className="mt-1.5">
          <span className="font-semibold text-[15px] text-gray-900">${price}</span>
          <span className="text-[15px] text-gray-500"> per {priceUnit}</span>
        </p>
      </div>
    </CardWrapper>
  );
}

// Skeleton loader for the card
export function VendorCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl bg-gray-200" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default VendorCardAirbnb;
