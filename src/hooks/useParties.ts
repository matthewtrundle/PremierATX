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
      let query = supabase
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

      const { data, error } = await supabase
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

      const { data, error } = await supabase
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

      const { data, error } = await supabase
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

      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { error } = await supabase
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

      const { data, error } = await supabase
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
