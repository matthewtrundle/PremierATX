// Service Vendors CRUD Hooks
// Manages vendor data for the party planning platform (supply side)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ServiceVendor,
  ServiceVendorInsert,
  ServiceVendorUpdate,
  VendorType,
  VendorWithPackages
} from '@/types/partyPlanning';
import { toast } from 'sonner';

// Query keys
export const vendorKeys = {
  all: ['service-vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  bySlug: (slug: string) => [...vendorKeys.all, 'slug', slug] as const,
  byType: (type: VendorType) => [...vendorKeys.all, 'type', type] as const,
  withPackages: (id: string) => [...vendorKeys.all, 'with-packages', id] as const,
};

// Fetch all service vendors
export function useServiceVendors(options?: {
  activeOnly?: boolean;
  vendorType?: VendorType;
  serviceArea?: string;
  featuredOnly?: boolean;
}) {
  return useQuery({
    queryKey: vendorKeys.list(options || {}),
    queryFn: async () => {
      let query = supabase
        .from('service_vendors')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .order('name');

      if (options?.activeOnly !== false) {
        query = query.eq('is_active', true);
      }

      if (options?.vendorType) {
        query = query.eq('vendor_type', options.vendorType);
      }

      if (options?.serviceArea) {
        query = query.contains('service_area', [options.serviceArea]);
      }

      if (options?.featuredOnly) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching service vendors:', error);
        throw error;
      }

      return data as ServiceVendor[];
    },
  });
}

// Fetch a single vendor by ID
export function useServiceVendor(id: string | undefined) {
  return useQuery({
    queryKey: vendorKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('service_vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching service vendor:', error);
        throw error;
      }

      return data as ServiceVendor;
    },
    enabled: !!id,
  });
}

// Fetch a vendor by slug (for URL routing)
export function useServiceVendorBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: vendorKeys.bySlug(slug || ''),
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('service_vendors')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching service vendor by slug:', error);
        throw error;
      }

      return data as ServiceVendor;
    },
    enabled: !!slug,
  });
}

// Fetch vendor with packages
export function useVendorWithPackages(id: string | undefined) {
  return useQuery({
    queryKey: vendorKeys.withPackages(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('service_vendors')
        .select(`
          *,
          packages:service_packages(*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching vendor with packages:', error);
        throw error;
      }

      return data as VendorWithPackages;
    },
    enabled: !!id,
  });
}

// Fetch vendors by type
export function useVendorsByType(type: VendorType | undefined) {
  return useQuery({
    queryKey: vendorKeys.byType(type || 'catering'),
    queryFn: async () => {
      if (!type) return [];

      const { data, error } = await supabase
        .from('service_vendors')
        .select('*')
        .eq('vendor_type', type)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching vendors by type:', error);
        throw error;
      }

      return data as ServiceVendor[];
    },
    enabled: !!type,
  });
}

// Create a new service vendor
export function useCreateServiceVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: ServiceVendorInsert) => {
      const { data, error } = await supabase
        .from('service_vendors')
        .insert(vendor)
        .select()
        .single();

      if (error) {
        console.error('Error creating service vendor:', error);
        throw error;
      }

      return data as ServiceVendor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success(`Vendor "${data.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create vendor: ${error.message}`);
    },
  });
}

// Update a service vendor
export function useUpdateServiceVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServiceVendorUpdate }) => {
      const { data, error } = await supabase
        .from('service_vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating service vendor:', error);
        throw error;
      }

      return data as ServiceVendor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success(`Vendor "${data.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vendor: ${error.message}`);
    },
  });
}

// Delete a service vendor (soft delete)
export function useDeleteServiceVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_vendors')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting service vendor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete vendor: ${error.message}`);
    },
  });
}

// Search vendors
export function useSearchVendors(searchTerm: string, options?: {
  vendorType?: VendorType;
  serviceArea?: string;
}) {
  return useQuery({
    queryKey: [...vendorKeys.lists(), 'search', searchTerm, options],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      let query = supabase
        .from('service_vendors')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(20);

      if (options?.vendorType) {
        query = query.eq('vendor_type', options.vendorType);
      }

      if (options?.serviceArea) {
        query = query.contains('service_area', [options.serviceArea]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching vendors:', error);
        throw error;
      }

      return data as ServiceVendor[];
    },
    enabled: searchTerm.length >= 2,
  });
}

// Generate a slug from a name
export function generateVendorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}
