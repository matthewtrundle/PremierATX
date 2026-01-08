// Multi-Vendor Cart Component
// Displays party cart items grouped by vendor with wholesale savings

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyCart, calculateItemPrice, calculateItemRetail } from '@/hooks/usePartyCart';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { BottomSheet, ConfirmSheet } from '@/components/ui/BottomSheet';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  X,
  Trash2,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Tag,
  Sparkles,
  ChefHat,
  Music,
  Camera,
  Car,
  Anchor,
  PartyPopper,
  Flower2 as Spa,
  Map as Compass,
  Paintbrush as Palette,
} from 'lucide-react';
import '@/styles/party-design-tokens.css';

// Vendor type icons
const vendorTypeIcons: Record<string, React.ElementType> = {
  catering: ChefHat,
  dj: Music,
  entertainment: PartyPopper,
  photography: Camera,
  transportation: Car,
  activities: Anchor,
  spa: Spa,
  tours: Compass,
  decor: Palette,
};

// Format currency
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Cart Summary Bar (sticky at bottom when items in cart)
interface CartSummaryBarProps {
  onClick: () => void;
  className?: string;
}

export function CartSummaryBar({ onClick, className }: CartSummaryBarProps) {
  const { totals, cartFlash } = usePartyCart();
  const { primaryColor } = useVRPartnerContext();

  if (totals.itemCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-40 md:bottom-6 md:left-auto md:right-6 md:w-auto',
        className
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          'w-full md:w-auto flex items-center justify-between gap-4 px-5 py-3.5 rounded-xl shadow-lg',
          'bg-gray-900 text-white',
          'transition-all duration-300',
          cartFlash && 'animate-pulse scale-105'
        )}
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
              {totals.itemCount}
            </span>
          </div>
          <span className="font-medium">View Party Cart</span>
        </div>

        <div className="flex items-center gap-3">
          {totals.totalSavings > 0 && (
            <span className="text-sm opacity-90">
              Save {formatPrice(totals.totalSavings)}
            </span>
          )}
          <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}

// Cart Item Card
interface CartItemCardProps {
  item: ReturnType<typeof usePartyCart>['items'][0];
  onRemove: () => void;
  onUpdate: (updates: Partial<typeof item>) => void;
}

function CartItemCard({ item, onRemove, onUpdate }: CartItemCardProps) {
  const pkg = item.package;
  const price = calculateItemPrice(item);
  const retail = calculateItemRetail(item);
  const savings = retail - price;

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      {/* Package Image */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {pkg.images?.[0] ? (
          <img
            src={pkg.images[0]}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-900 truncate">{pkg.name}</h4>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(item.service_date)}
          </span>
          {item.service_time_start && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {item.service_time_start}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {item.guest_count} guests
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-gray-900">{formatPrice(price)}</span>
          {savings > 0 && (
            <>
              <span className="text-sm text-gray-400 line-through">{formatPrice(retail)}</span>
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                Save {formatPrice(savings)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Vendor Group Section
interface VendorGroupProps {
  group: ReturnType<typeof usePartyCart>['itemsByVendor'][0];
  onRemoveItem: (vendorId: string, packageId: string, serviceDate: string) => void;
  onUpdateItem: (vendorId: string, packageId: string, serviceDate: string, updates: any) => void;
}

function VendorGroup({ group, onRemoveItem, onUpdateItem }: VendorGroupProps) {
  const { vendor, items, subtotal, savings } = group;
  const Icon = vendorTypeIcons[vendor.vendor_type] || PartyPopper;

  return (
    <div className="mb-6 last:mb-0">
      {/* Vendor Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={vendor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <Icon className="w-5 h-5 text-gray-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{vendor.vendor_type.replace('_', ' ')}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatPrice(subtotal)}</p>
          {savings > 0 && (
            <p className="text-xs text-green-600">-{formatPrice(savings)}</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="pl-13">
        {items.map((item) => (
          <CartItemCard
            key={`${item.vendor_id}-${item.package_id}-${item.service_date}`}
            item={item}
            onRemove={() => onRemoveItem(item.vendor_id, item.package_id, item.service_date)}
            onUpdate={(updates) =>
              onUpdateItem(item.vendor_id, item.package_id, item.service_date, updates)
            }
          />
        ))}
      </div>
    </div>
  );
}

// Main Cart Component (Full page or modal)
interface MultiVendorCartProps {
  className?: string;
}

export function MultiVendorCart({ className }: MultiVendorCartProps) {
  const navigate = useNavigate();
  const { getPartnerPath, primaryColor } = useVRPartnerContext();
  const {
    items,
    itemsByVendor,
    totals,
    removeItem,
    updateItem,
    clearCart,
    isCartOpen,
    closeCart,
  } = usePartyCart();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCheckout = () => {
    closeCart();
    navigate(getPartnerPath('/checkout'));
  };

  const handleContinueShopping = () => {
    closeCart();
    navigate(getPartnerPath('/vendors'));
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your party cart is empty</h3>
        <p className="text-gray-500 mb-6">Browse vendors to start planning your party!</p>
        <button
          onClick={handleContinueShopping}
          className="px-6 py-3 rounded-xl font-medium text-white transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          Browse Vendors
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Party Cart</h2>
          <p className="text-sm text-gray-500">
            {totals.itemCount} item{totals.itemCount !== 1 ? 's' : ''} from{' '}
            {totals.vendorCount} vendor{totals.vendorCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Clear cart"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Savings Banner */}
      {totals.totalSavings > 0 && (
        <div className="mx-4 mt-4 px-4 py-3 bg-green-50 rounded-xl flex items-center gap-3">
          <Tag className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">
              You're saving {formatPrice(totals.totalSavings)}!
            </p>
            <p className="text-sm text-green-600">
              {totals.savingsPercent}% off retail prices with group booking
            </p>
          </div>
        </div>
      )}

      {/* Vendor Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {itemsByVendor.map((group) => (
          <VendorGroup
            key={group.vendor.id}
            group={group}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
          />
        ))}
      </div>

      {/* Footer with Totals */}
      <div className="border-t border-gray-100 px-4 py-4 bg-white">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.totalSavings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Group Savings</span>
              <span className="text-green-600">-{formatPrice(totals.totalSavings)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-100">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatPrice(totals.subtotal)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-colors"
            style={{ backgroundColor: primaryColor, minHeight: '48px' }}
          >
            Proceed to Checkout
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full py-3.5 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            style={{ minHeight: '48px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <ConfirmSheet
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearCart();
          setShowClearConfirm(false);
        }}
        title="Clear Cart?"
        message="Are you sure you want to remove all items from your party cart? This action cannot be undone."
        confirmLabel="Clear Cart"
        cancelLabel="Keep Items"
        confirmVariant="danger"
      />
    </div>
  );
}

// Cart Sheet (Mobile Bottom Sheet)
interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[50, 90]}
      defaultSnapPoint={1}
      showHandle
      showClose={false}
    >
      <MultiVendorCart />
    </BottomSheet>
  );
}

// Cart Page (for /cart route)
export function CartPage() {
  const navigate = useNavigate();
  const { getPartnerPath } = useVRPartnerContext();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 ml-2">Party Cart</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <MultiVendorCart />
      </main>
    </div>
  );
}

export default MultiVendorCart;
