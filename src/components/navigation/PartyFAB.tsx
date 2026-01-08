// Party FAB - Floating Action Button
// Shows when there are items in the party, provides quick access to party hub

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { ShoppingBag, PartyPopper, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/party-design-tokens.css';

interface PartyFABProps {
  itemCount: number;
  totalPrice?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function PartyFAB({
  itemCount,
  totalPrice,
  isExpanded = false,
  onToggle,
  className,
}: PartyFABProps) {
  const navigate = useNavigate();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();

  // Don't render if no items
  if (itemCount === 0) return null;

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      navigate(getPartnerPath('/party'));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        // Position: above bottom nav on mobile, bottom-right on desktop
        'bottom-20 right-4 lg:bottom-6 lg:right-6',
        className
      )}
    >
      {/* Expanded Card View */}
      {isExpanded && (
        <div
          className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-2xl shadow-floating overflow-hidden animate-scale-in"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Your Party</h3>
              <button
                onClick={onToggle}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {itemCount} vendor{itemCount !== 1 ? 's' : ''} selected
            </p>
          </div>

          <div className="p-4 space-y-3">
            {totalPrice !== undefined && totalPrice > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated total</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            )}

            <button
              onClick={() => navigate(getPartnerPath('/party'))}
              className="w-full py-3 rounded-xl text-white font-semibold transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              View Party Details
            </button>

            <button
              onClick={() => navigate(getPartnerPath('/checkout'))}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 px-5 py-3.5 rounded-full shadow-lg transition-all',
          'hover:shadow-xl hover:scale-105 active:scale-95',
          'text-white font-semibold'
        )}
        style={{ backgroundColor: primaryColor }}
        aria-label={`View party with ${itemCount} items`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white text-xs font-bold"
            style={{ color: primaryColor }}
          >
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        </div>
        <span className="hidden sm:inline">View Party</span>
        {totalPrice !== undefined && totalPrice > 0 && (
          <>
            <span className="hidden sm:inline text-white/60">·</span>
            <span className="hidden sm:inline">{formatPrice(totalPrice)}</span>
          </>
        )}
      </button>
    </div>
  );
}

// Mini FAB variant - just the icon with badge
export function PartyFABMini({
  itemCount,
  className,
}: {
  itemCount: number;
  className?: string;
}) {
  const navigate = useNavigate();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();

  if (itemCount === 0) return null;

  return (
    <button
      onClick={() => navigate(getPartnerPath('/party'))}
      className={cn(
        'fixed z-50 bottom-20 right-4 lg:bottom-6 lg:right-6',
        'w-14 h-14 rounded-full shadow-lg transition-all',
        'hover:shadow-xl hover:scale-105 active:scale-95',
        'flex items-center justify-center text-white',
        className
      )}
      style={{ backgroundColor: primaryColor }}
      aria-label={`View party with ${itemCount} items`}
    >
      <div className="relative">
        <PartyPopper className="w-6 h-6" />
        <span
          className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white text-xs font-bold"
          style={{ color: primaryColor }}
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      </div>
    </button>
  );
}

export default PartyFAB;
