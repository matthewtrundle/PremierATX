'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionCarouselProps {
  title: string;
  children: ReactNode;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
}

export function SectionCarousel({
  title,
  children,
  showViewAll = false,
  viewAllHref = '#',
  className,
}: SectionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollEl.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-[22px] font-semibold text-gray-900">{title}</h2>
          {showViewAll && (
            <a
              href={viewAllHref}
              className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:underline ml-2"
            >
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-all',
              canScrollLeft
                ? 'hover:border-gray-900 hover:shadow-sm cursor-pointer bg-white'
                : 'opacity-40 cursor-not-allowed bg-gray-50'
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-all',
              canScrollRight
                ? 'hover:border-gray-900 hover:shadow-sm cursor-pointer bg-white'
                : 'opacity-40 cursor-not-allowed bg-gray-50'
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>
    </div>
  );
}

// Carousel item wrapper for consistent sizing
export function CarouselCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-13px)]',
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {children}
    </div>
  );
}

export default SectionCarousel;
