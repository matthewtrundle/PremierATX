// Parties CRUD Hooks
// Manages party data for the party planning platform (core entity)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Party,
  PartyInsert,
  PartyUpdate,
  PartyWithDetails,
  PartyStatus
} from '@/types/partyPlanning';
import { toast } from 'sonner';

// Query keys
export const partyKeys = {
  all: ['parties'] as const,
  lists: () => [...partyKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...partyKeys.lists(), filters] as const,
  details: () => [...partyKeys.all, 'detail'] as const,
  detail: (id: string) => [...partyKeys.details(), id] as const,
  byPartner: (partnerId: string) => [...partyKeys.all, 'partner', partnerId] as const,
  byOrganizer: (email: string) => [...partyKeys.all, 'organizer', email] as const,
  withDetails: (id: string) => [...partyKeys.all, 'with-details', id] as const,
  byShareToken: (token: string) => [...partyKeys.all, 'share-token', token] as const,
};

// Fetch all parties (for admin)
export function useParties(options?: {
  vrPartnerId?: string;
  status?: PartyStatus;
  organizerEmail?: string;
}) {
  return useQuery({
    queryKey: partyKeys.list(options || {}),
    queryFn: async () => {
      // Use 'any' to bypass missing table types (parties table added but types not regenerated)
      const client = supabase as any;
      let query = client
        .from('parties')
        .select(`
          *,
          vr_partner:vr_partners(id, name, slug, logo_url)
        `)
        .order('party_date', { ascending: true });

      if (options?.vrPartnerId) {
        query = query.eq('vr_partner_id', options.vrPartnerId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.organizerEmail) {
        query = query.eq('organizer_email', options.organizerEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching parties:', error);
        throw error;
      }

      return data as Party[];
    },
  });
}

// Fetch a single party by ID
export function useParty(id: string | undefined) {
  return useQuery({
    queryKey: partyKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .select(`
          *,
          vr_partner:vr_partners(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching party:', error);
        throw error;
      }

      return data as Party;
    },
    enabled: !!id,
  });
}

// Fetch a party with full details (bookings, guests)
export function usePartyWithDetails(id: string | undefined) {
  return useQuery({
    queryKey: partyKeys.withDetails(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .select(`
          *,
          vr_partner:vr_partners(*),
          bookings:party_bookings(
            *,
            vendor:service_vendors(*),
            package:service_packages(*)
          ),
          guests:party_guests(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching party with details:', error);
        throw error;
      }

      return data as PartyWithDetails;
    },
    enabled: !!id,
  });
}

// Fetch parties for a VR partner
export function usePartiesByPartner(partnerId: string | undefined) {
  return useQuery({
    queryKey: partyKeys.byPartner(partnerId || ''),
    queryFn: async () => {
      if (!partnerId) return [];

      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .select(`
          *,
          bookings:party_bookings(id, status, guest_pays),
          guests:party_guests(id, rsvp_status)
        `)
        .eq('vr_partner_id', partnerId)
        .order('party_date', { ascending: true });

      if (error) {
        console.error('Error fetching parties by partner:', error);
        throw error;
      }

      return data as Party[];
    },
    enabled: !!partnerId,
  });
}

// Fetch parties by organizer email
export function usePartiesByOrganizer(email: string | undefined) {
  return useQuery({
    queryKey: partyKeys.byOrganizer(email || ''),
    queryFn: async () => {
      if (!email) return [];

      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .select(`
          *,
          vr_partner:vr_partners(id, name, slug, logo_url),
          bookings:party_bookings(id, status, guest_pays),
          guests:party_guests(id, rsvp_status)
        `)
        .eq('organizer_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching parties by organizer:', error);
        throw error;
      }

      return data as Party[];
    },
    enabled: !!email,
  });
}

// Create a new party
export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (party: PartyInsert) => {
      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .insert(party)
        .select()
        .single();

      if (error) {
        console.error('Error creating party:', error);
        throw error;
      }

      return data as Party;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success(`Party "${data.party_name || 'Your party'}" created successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create party: ${error.message}`);
    },
  });
}

// Update a party
export function useUpdateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PartyUpdate }) => {
      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating party:', error);
        throw error;
      }

      return data as Party;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success('Party updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update party: ${error.message}`);
    },
  });
}

// Update party status
export function useUpdatePartyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PartyStatus }) => {
      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating party status:', error);
        throw error;
      }

      return data as Party;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success(`Party status updated to ${data.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update party status: ${error.message}`);
    },
  });
}

// Delete a party (soft delete - sets status to cancelled)
export function useDeleteParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const client = supabase as any;
      const { error } = await client
        .from('parties')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting party:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success('Party cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel party: ${error.message}`);
    },
  });
}

// Get party stats for a partner
export function usePartyStats(partnerId: string | undefined) {
  return useQuery({
    queryKey: [...partyKeys.byPartner(partnerId || ''), 'stats'],
    queryFn: async () => {
      if (!partnerId) return null;

      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .select('status, total_amount')
        .eq('vr_partner_id', partnerId);

      if (error) {
        console.error('Error fetching party stats:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        planning: data.filter(p => p.status === 'planning').length,
        booked: data.filter(p => p.status === 'booked').length,
        confirmed: data.filter(p => p.status === 'confirmed').length,
        completed: data.filter(p => p.status === 'completed').length,
        cancelled: data.filter(p => p.status === 'cancelled').length,
        totalRevenue: data.reduce((sum, p) => sum + (p.total_amount || 0), 0),
      };

      return stats;
    },
    enabled: !!partnerId,
  });
}

// =============================================================================
// SHARE TOKEN HOOKS - For personalized party links
// =============================================================================

// Type for party with partner branding (used in guest landing page)
export interface PartyWithPartnerBranding {
  party: Party;
  partner: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    branding_config: {
      primary_color?: string;
      secondary_color?: string;
      font_family?: string;
      tagline?: string;
      hero_image?: string;
      description?: string;
    };
  } | null;
}

// Fetch a party by its share token (for guest landing page)
// This is used when guests click their personalized party link
export function usePartyByShareToken(token: string | undefined) {
  return useQuery({
    queryKey: partyKeys.byShareToken(token || ''),
    queryFn: async (): Promise<PartyWithPartnerBranding | null> => {
      if (!token) return null;

      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .select(`
          *,
          vr_partner:vr_partners(
            id,
            name,
            slug,
            logo_url,
            branding_config
          )
        `)
        .eq('share_token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No party found with this token
          console.warn('No party found with share token:', token);
          return null;
        }
        console.error('Error fetching party by share token:', error);
        throw error;
      }

      // Transform the response
      return {
        party: {
          ...data,
          vr_partner: undefined, // Remove nested object from party
        } as Party,
        partner: data.vr_partner as PartyWithPartnerBranding['partner'],
      };
    },
    enabled: !!token,
    // Don't retry on 404
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116') return false;
      return failureCount < 3;
    },
  });
}

// Fetch party with full details by share token (including bookings and guests)
export function usePartyWithDetailsByShareToken(token: string | undefined) {
  return useQuery({
    queryKey: [...partyKeys.byShareToken(token || ''), 'with-details'],
    queryFn: async () => {
      if (!token) return null;

      const client = supabase as any;
      const { data, error } = await client
        .from('parties')
        .select(`
          *,
          vr_partner:vr_partners(
            id,
            name,
            slug,
            logo_url,
            branding_config
          ),
          bookings:party_bookings(
            *,
            vendor:service_vendors(id, name, slug, vendor_type, logo_url, cover_image_url),
            package:service_packages(id, name, description, guest_price, retail_price, features)
          ),
          guests:party_guests(*)
        `)
        .eq('share_token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching party with details by share token:', error);
        throw error;
      }

      return {
        party: data as PartyWithDetails,
        partner: data.vr_partner as PartyWithPartnerBranding['partner'],
      };
    },
    enabled: !!token,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116') return false;
      return failureCount < 3;
    },
  });
}

// Generate a shareable URL for a party
export function getPartyShareUrl(shareToken: string): string {
  // In production, this would be the actual domain
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://premieratx.com';

  return `${baseUrl}/p/${shareToken}`;
}
