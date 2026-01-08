// Party Cart Hook
// Manages the multi-vendor party cart with wholesale pricing

import { useState, useCallback, useEffect, useMemo } from 'react';
import { PartyCartItem, ServiceVendor, ServicePackage, VendorType } from '@/types/partyPlanning';

export interface PartyCartState {
  partyId?: string;
  items: PartyCartItem[];
  createdAt: string;
  updatedAt: string;
}

interface VendorGroup {
  vendor: ServiceVendor;
  items: PartyCartItem[];
  subtotal: number;
  retailTotal: number;
  savings: number;
}

const STORAGE_KEY = 'party-cart';

// Initial empty state
const initialState: PartyCartState = {
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function usePartyCart() {
  // Get cart from storage
  const getCartFromStorage = (): PartyCartState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialState;
    } catch {
      return initialState;
    }
  };

  const [cartState, setCartState] = useState<PartyCartState>(getCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFlash, setCartFlash] = useState(false);

  // Persist to localStorage
  const persistCart = useCallback((state: PartyCartState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('party-cart:changed'));
    } catch (error) {
      console.warn('Failed to save party cart:', error);
    }
  }, []);

  // Update cart state and persist
  const updateCart = useCallback((updater: (prev: PartyCartState) => PartyCartState) => {
    setCartState((prev) => {
      const newState = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      persistCart(newState);
      return newState;
    });
  }, [persistCart]);

  // Cross-instance sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCartState(getCartFromStorage());
      }
    };
    const onCustom = () => {
      setCartState(getCartFromStorage());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('party-cart:changed', onCustom as unknown as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('party-cart:changed', onCustom as unknown as EventListener);
    };
  }, []);

  // Add item to cart
  const addItem = useCallback((item: PartyCartItem) => {
    updateCart((prev) => {
      // Check if item already exists (same vendor + package + date)
      const existingIndex = prev.items.findIndex(
        (i) =>
          i.vendor_id === item.vendor_id &&
          i.package_id === item.package_id &&
          i.service_date === item.service_date
      );

      if (existingIndex >= 0) {
        // Update existing item
        const newItems = [...prev.items];
        newItems[existingIndex] = item;
        return { ...prev, items: newItems };
      }

      // Add new item
      return { ...prev, items: [...prev.items, item] };
    });

    // Trigger cart flash animation
    setCartFlash(true);
    setTimeout(() => setCartFlash(false), 600);
  }, [updateCart]);

  // Remove item from cart
  const removeItem = useCallback((vendorId: string, packageId: string, serviceDate: string) => {
    updateCart((prev) => ({
      ...prev,
      items: prev.items.filter(
        (i) =>
          !(i.vendor_id === vendorId && i.package_id === packageId && i.service_date === serviceDate)
      ),
    }));
  }, [updateCart]);

  // Update item details
  const updateItem = useCallback(
    (vendorId: string, packageId: string, serviceDate: string, updates: Partial<PartyCartItem>) => {
      updateCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.vendor_id === vendorId &&
          item.package_id === packageId &&
          item.service_date === serviceDate
            ? { ...item, ...updates }
            : item
        ),
      }));
    },
    [updateCart]
  );

  // Clear the entire cart
  const clearCart = useCallback(() => {
    updateCart(() => ({
      ...initialState,
      createdAt: new Date().toISOString(),
    }));
  }, [updateCart]);

  // Set party ID for the cart
  const setPartyId = useCallback((partyId: string) => {
    updateCart((prev) => ({ ...prev, partyId }));
  }, [updateCart]);

  // Group items by vendor
  const itemsByVendor = useMemo((): VendorGroup[] => {
    const groups = new Map<string, PartyCartItem[]>();

    cartState.items.forEach((item) => {
      const existing = groups.get(item.vendor_id) || [];
      groups.set(item.vendor_id, [...existing, item]);
    });

    return Array.from(groups.entries()).map(([vendorId, items]) => {
      const vendor = items[0].vendor;
      const subtotal = items.reduce((sum, item) => {
        const price = calculateItemPrice(item);
        return sum + price;
      }, 0);
      const retailTotal = items.reduce((sum, item) => {
        const retail = calculateItemRetail(item);
        return sum + retail;
      }, 0);

      return {
        vendor,
        items,
        subtotal,
        retailTotal,
        savings: retailTotal - subtotal,
      };
    });
  }, [cartState.items]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = itemsByVendor.reduce((sum, group) => sum + group.subtotal, 0);
    const retailTotal = itemsByVendor.reduce((sum, group) => sum + group.retailTotal, 0);
    const totalSavings = retailTotal - subtotal;
    const savingsPercent = retailTotal > 0 ? Math.round((totalSavings / retailTotal) * 100) : 0;

    return {
      subtotal,
      retailTotal,
      totalSavings,
      savingsPercent,
      itemCount: cartState.items.length,
      vendorCount: itemsByVendor.length,
    };
  }, [cartState.items, itemsByVendor]);

  // Check if a package is in the cart
  const isInCart = useCallback(
    (vendorId: string, packageId: string): boolean => {
      return cartState.items.some(
        (item) => item.vendor_id === vendorId && item.package_id === packageId
      );
    },
    [cartState.items]
  );

  // Get cart item by package
  const getCartItem = useCallback(
    (vendorId: string, packageId: string): PartyCartItem | undefined => {
      return cartState.items.find(
        (item) => item.vendor_id === vendorId && item.package_id === packageId
      );
    },
    [cartState.items]
  );

  // Toggle cart open/closed
  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return {
    // State
    items: cartState.items,
    partyId: cartState.partyId,
    itemsByVendor,
    totals,
    isCartOpen,
    cartFlash,

    // Actions
    addItem,
    removeItem,
    updateItem,
    clearCart,
    setPartyId,
    isInCart,
    getCartItem,

    // Cart UI
    toggleCart,
    openCart,
    closeCart,
  };
}

// Helper functions for price calculations
function calculateItemPrice(item: PartyCartItem): number {
  const { package: pkg, guest_count } = item;
  const basePrice = pkg.guest_price;

  switch (pkg.price_type) {
    case 'per_person':
      return basePrice * guest_count;
    case 'hourly':
      const hours = pkg.duration_hours || 1;
      return basePrice * hours;
    case 'fixed':
    default:
      return basePrice;
  }
}

function calculateItemRetail(item: PartyCartItem): number {
  const { package: pkg, guest_count } = item;
  const retailPrice = pkg.retail_price;

  switch (pkg.price_type) {
    case 'per_person':
      return retailPrice * guest_count;
    case 'hourly':
      const hours = pkg.duration_hours || 1;
      return retailPrice * hours;
    case 'fixed':
    default:
      return retailPrice;
  }
}

// Export price calculation helpers for use in other components
export { calculateItemPrice, calculateItemRetail };

export default usePartyCart;
