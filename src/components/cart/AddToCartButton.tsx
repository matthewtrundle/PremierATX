// Add to Cart Button Component
// Button for adding vendor packages to the party cart

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyCart } from '@/hooks/usePartyCart';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { ServiceVendor, ServicePackage, PartyCartItem } from '@/types/partyPlanning';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Check,
  Calendar,
  Clock,
  Users,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import '@/styles/party-design-tokens.css';

interface AddToCartButtonProps {
  vendor: ServiceVendor;
  package: ServicePackage;
  className?: string;
  fullWidth?: boolean;
}

export function AddToCartButton({
  vendor,
  package: pkg,
  className,
  fullWidth = false,
}: AddToCartButtonProps) {
  const navigate = useNavigate();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();
  const { addItem, isInCart, removeItem, openCart } = usePartyCart();

  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('');
  const [guestCount, setGuestCount] = useState(pkg.min_guests || 10);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const alreadyInCart = isInCart(vendor.id, pkg.id);

  // Calculate price based on guest count / duration
  const calculatePrice = () => {
    switch (pkg.price_type) {
      case 'per_person':
        return pkg.guest_price * guestCount;
      case 'hourly':
        return pkg.guest_price * (pkg.duration_hours || 1);
      default:
        return pkg.guest_price;
    }
  };

  const calculateRetail = () => {
    switch (pkg.price_type) {
      case 'per_person':
        return pkg.retail_price * guestCount;
      case 'hourly':
        return pkg.retail_price * (pkg.duration_hours || 1);
      default:
        return pkg.retail_price;
    }
  };

  const handleAddToCart = () => {
    // If already in cart, just open the cart
    if (alreadyInCart) {
      openCart();
      return;
    }
    // Show booking details sheet
    setShowBookingSheet(true);
  };

  const handleConfirmAdd = () => {
    if (!serviceDate) return;

    const cartItem: PartyCartItem = {
      vendor_id: vendor.id,
      package_id: pkg.id,
      vendor,
      package: pkg,
      service_date: serviceDate,
      service_time_start: serviceTime || undefined,
      guest_count: guestCount,
      special_requests: specialRequests || undefined,
    };

    addItem(cartItem);
    setShowBookingSheet(false);
    setIsAdded(true);

    // Reset animation after a bit
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleRemoveFromCart = () => {
    // Find the item and remove it
    removeItem(vendor.id, pkg.id, serviceDate || '');
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Format price for display
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        className={cn(
          'flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all',
          fullWidth ? 'w-full' : 'px-6',
          alreadyInCart
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'text-white hover:opacity-90',
          isAdded && 'animate-pulse',
          className
        )}
        style={{
          backgroundColor: alreadyInCart ? undefined : primaryColor,
          minHeight: '48px',
        }}
      >
        {alreadyInCart ? (
          <>
            <Check className="w-5 h-5" />
            <span>In Your Party</span>
          </>
        ) : isAdded ? (
          <>
            <Check className="w-5 h-5" />
            <span>Added!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Party</span>
          </>
        )}
      </button>

      {/* Booking Details Sheet */}
      <BottomSheet
        isOpen={showBookingSheet}
        onClose={() => setShowBookingSheet(false)}
        title="Select Date & Details"
        snapPoints={[85]}
        defaultSnapPoint={0}
      >
        <div className="space-y-6">
          {/* Package Summary */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            {pkg.images?.[0] && (
              <img
                src={pkg.images[0]}
                alt={pkg.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
              <p className="text-sm text-gray-500">{vendor.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-bold text-gray-900">{formatPrice(calculatePrice())}</span>
                {pkg.retail_price > pkg.guest_price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(calculateRetail())}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Service Date *
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              min={minDate}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Time Selection (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Start Time (optional)
            </label>
            <input
              type="time"
              value={serviceTime}
              onChange={(e) => setServiceTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Guest Count */}
          {(pkg.price_type === 'per_person' || pkg.min_guests || pkg.max_guests) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Guest Count
                {pkg.min_guests && pkg.max_guests && (
                  <span className="font-normal text-gray-400 ml-1">
                    ({pkg.min_guests}-{pkg.max_guests})
                  </span>
                )}
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(pkg.min_guests || 1, guestCount - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-16 text-center">{guestCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.min(pkg.max_guests || 100, guestCount + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {pkg.price_type === 'per_person' && (
                <p className="text-sm text-gray-500 mt-2">
                  {formatPrice(pkg.guest_price)} per person × {guestCount} guests
                </p>
              )}
            </div>
          )}

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests (optional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or notes for this booking..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your Price</span>
              <div className="text-right">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(calculatePrice())}
                </span>
                {calculateRetail() > calculatePrice() && (
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(calculateRetail())}
                    </span>
                    <span className="text-sm px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                      Save {formatPrice(calculateRetail() - calculatePrice())}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirmAdd}
              disabled={!serviceDate}
              className={cn(
                'w-full py-3.5 rounded-xl font-semibold text-white transition-colors',
                !serviceDate && 'opacity-50 cursor-not-allowed'
              )}
              style={{ backgroundColor: primaryColor, minHeight: '48px' }}
            >
              <ShoppingCart className="inline w-5 h-5 mr-2" />
              Add to Party Cart
            </button>
            <button
              onClick={() => setShowBookingSheet(false)}
              className="w-full py-3.5 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

// Quick Add Button (for use in cards, no sheet)
interface QuickAddButtonProps {
  vendor: ServiceVendor;
  package: ServicePackage;
  defaultDate?: string;
  defaultGuestCount?: number;
  className?: string;
}

export function QuickAddButton({
  vendor,
  package: pkg,
  defaultDate,
  defaultGuestCount = 10,
  className,
}: QuickAddButtonProps) {
  const { primaryColor } = useVRPartnerContext();
  const { addItem, isInCart, openCart } = usePartyCart();
  const [isAdded, setIsAdded] = useState(false);

  const alreadyInCart = isInCart(vendor.id, pkg.id);

  const handleClick = () => {
    if (alreadyInCart) {
      openCart();
      return;
    }

    if (!defaultDate) {
      // If no date provided, just open the cart
      openCart();
      return;
    }

    const cartItem: PartyCartItem = {
      vendor_id: vendor.id,
      package_id: pkg.id,
      vendor,
      package: pkg,
      service_date: defaultDate,
      guest_count: defaultGuestCount,
    };

    addItem(cartItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      className={cn(
        'p-2 rounded-full transition-all',
        alreadyInCart
          ? 'bg-green-100 text-green-700'
          : 'bg-white text-gray-900 shadow-md hover:scale-110',
        isAdded && 'animate-pulse',
        className
      )}
      style={!alreadyInCart ? { color: primaryColor } : undefined}
      aria-label={alreadyInCart ? 'View in cart' : 'Add to party'}
    >
      {alreadyInCart || isAdded ? (
        <Check className="w-5 h-5" />
      ) : (
        <Plus className="w-5 h-5" />
      )}
    </button>
  );
}

export default AddToCartButton;
