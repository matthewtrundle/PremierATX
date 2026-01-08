// Service Packages CRUD Hooks
// Manages vendor service packages for the party planning platform

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ServicePackage,
  ServicePackageInsert,
  ServicePackageUpdate
} from '@/types/partyPlanning';
import { toast } from 'sonner';
import { vendorKeys } from './useServiceVendors';

// Query keys
export const packageKeys = {
  all: ['service-packages'] as const,
  lists: () => [...packageKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...packageKeys.lists(), filters] as const,
  details: () => [...packageKeys.all, 'detail'] as const,
  detail: (id: string) => [...packageKeys.details(), id] as const,
  byVendor: (vendorId: string) => [...packageKeys.all, 'vendor', vendorId] as const,
};

// Fetch all packages for a vendor
export function useServicePackages(vendorId: string | undefined, options?: {
  activeOnly?: boolean;
}) {
  return useQuery({
    queryKey: packageKeys.byVendor(vendorId || ''),
    queryFn: async () => {
      if (!vendorId) return [];

      let query = supabase
        .from('service_packages')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('display_order')
        .order('name');

      if (options?.activeOnly !== false) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching service packages:', error);
        throw error;
      }

      return data as ServicePackage[];
    },
    enabled: !!vendorId,
  });
}

// Fetch a single package by ID
export function useServicePackage(id: string | undefined) {
  return useQuery({
    queryKey: packageKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('service_packages')
        .select(`
          *,
          vendor:service_vendors(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching service package:', error);
        throw error;
      }

      return data as ServicePackage;
    },
    enabled: !!id,
  });
}

// Fetch packages with vendor info (for cart display)
export function usePackagesWithVendors(packageIds: string[]) {
  return useQuery({
    queryKey: [...packageKeys.lists(), 'with-vendors', packageIds],
    queryFn: async () => {
      if (!packageIds.length) return [];

      const { data, error } = await supabase
        .from('service_packages')
        .select(`
          *,
          vendor:service_vendors(*)
        `)
        .in('id', packageIds);

      if (error) {
        console.error('Error fetching packages with vendors:', error);
        throw error;
      }

      return data as ServicePackage[];
    },
    enabled: packageIds.length > 0,
  });
}

// Create a new service package
export function useCreateServicePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: ServicePackageInsert) => {
      const { data, error } = await supabase
        .from('service_packages')
        .insert(pkg)
        .select()
        .single();

      if (error) {
        console.error('Error creating service package:', error);
        throw error;
      }

      return data as ServicePackage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success(`Package "${data.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create package: ${error.message}`);
    },
  });
}

// Update a service package
export function useUpdateServicePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServicePackageUpdate }) => {
      const { data, error } = await supabase
        .from('service_packages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating service package:', error);
        throw error;
      }

      return data as ServicePackage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success(`Package "${data.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update package: ${error.message}`);
    },
  });
}

// Delete a service package (soft delete)
export function useDeleteServicePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_packages')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting service package:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Package deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete package: ${error.message}`);
    },
  });
}

// Reorder packages
export function useReorderPackages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packages: { id: string; display_order: number }[]) => {
      const updates = packages.map(pkg =>
        supabase
          .from('service_packages')
          .update({ display_order: pkg.display_order })
          .eq('id', pkg.id)
      );

      const results = await Promise.all(updates);

      const error = results.find(r => r.error)?.error;
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder packages: ${error.message}`);
    },
  });
}

// Calculate pricing for a package based on guest count
export function calculatePackagePricing(
  pkg: ServicePackage,
  guestCount: number
): {
  guestPays: number;
  retailValue: number;
  savings: number;
  savingsPercent: number;
  platformMargin: number;
  vendorReceives: number;
} {
  let guestPays: number;
  let retailValue: number;
  let vendorReceives: number;

  switch (pkg.price_type) {
    case 'per_person':
      guestPays = pkg.guest_price * guestCount;
      retailValue = pkg.retail_price * guestCount;
      vendorReceives = pkg.net_price * guestCount;
      break;
    case 'hourly':
      const hours = pkg.duration_hours || 1;
      guestPays = pkg.guest_price * hours;
      retailValue = pkg.retail_price * hours;
      vendorReceives = pkg.net_price * hours;
      break;
    case 'fixed':
    default:
      guestPays = pkg.guest_price;
      retailValue = pkg.retail_price;
      vendorReceives = pkg.net_price;
      break;
  }

  const savings = retailValue - guestPays;
  const savingsPercent = retailValue > 0 ? Math.round((savings / retailValue) * 100) : 0;
  const platformMargin = guestPays - vendorReceives;

  return {
    guestPays,
    retailValue,
    savings,
    savingsPercent,
    platformMargin,
    vendorReceives,
  };
}
