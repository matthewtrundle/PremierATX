// VR Partners CRUD Hooks
// Manages vacation rental partner data for the party planning platform

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  VRPartner,
  VRPartnerInsert,
  VRPartnerUpdate
} from '@/types/partyPlanning';
import { toast } from 'sonner';

// Query keys
export const vrPartnerKeys = {
  all: ['vr-partners'] as const,
  lists: () => [...vrPartnerKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...vrPartnerKeys.lists(), filters] as const,
  details: () => [...vrPartnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...vrPartnerKeys.details(), id] as const,
  bySlug: (slug: string) => [...vrPartnerKeys.all, 'slug', slug] as const,
};

// Fetch all VR partners
export function useVRPartners(options?: {
  activeOnly?: boolean;
  includeDemo?: boolean;
}) {
  return useQuery({
    queryKey: vrPartnerKeys.list(options || {}),
    queryFn: async () => {
      let query = supabase
        .from('vr_partners')
        .select('*')
        .order('name');

      if (options?.activeOnly !== false) {
        query = query.eq('is_active', true);
      }

      if (options?.includeDemo === false) {
        query = query.eq('is_demo', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching VR partners:', error);
        throw error;
      }

      return data as VRPartner[];
    },
  });
}

// Fetch a single VR partner by ID
export function useVRPartner(id: string | undefined) {
  return useQuery({
    queryKey: vrPartnerKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('vr_partners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching VR partner:', error);
        throw error;
      }

      return data as VRPartner;
    },
    enabled: !!id,
  });
}

// Fetch a VR partner by slug (for subdomain routing)
export function useVRPartnerBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: vrPartnerKeys.bySlug(slug || ''),
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('vr_partners')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - partner not found
          return null;
        }
        console.error('Error fetching VR partner by slug:', error);
        throw error;
      }

      return data as VRPartner;
    },
    enabled: !!slug,
  });
}

// Create a new VR partner
export function useCreateVRPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: VRPartnerInsert) => {
      const { data, error } = await supabase
        .from('vr_partners')
        .insert(partner)
        .select()
        .single();

      if (error) {
        console.error('Error creating VR partner:', error);
        throw error;
      }

      return data as VRPartner;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vrPartnerKeys.all });
      toast.success(`VR Partner "${data.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create VR partner: ${error.message}`);
    },
  });
}

// Update a VR partner
export function useUpdateVRPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VRPartnerUpdate }) => {
      const { data, error } = await supabase
        .from('vr_partners')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating VR partner:', error);
        throw error;
      }

      return data as VRPartner;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vrPartnerKeys.all });
      toast.success(`VR Partner "${data.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update VR partner: ${error.message}`);
    },
  });
}

// Delete a VR partner (soft delete - sets is_active to false)
export function useDeleteVRPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vr_partners')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting VR partner:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vrPartnerKeys.all });
      toast.success('VR Partner deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete VR partner: ${error.message}`);
    },
  });
}

// Check if a slug is available
export function useCheckSlugAvailability() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data, error } = await supabase
        .from('vr_partners')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error checking slug availability:', error);
        throw error;
      }

      return { available: !data, slug };
    },
  });
}

// Generate a slug from a name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}
