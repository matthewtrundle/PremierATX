// Party Guests CRUD Hooks
// Manages guest data for parties

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PartyGuest,
  PartyGuestInsert,
  PartyGuestUpdate,
  RSVPStatus,
  PaymentStatus
} from '@/types/partyPlanning';
import { toast } from 'sonner';
import { partyKeys } from './useParties';

// Type bypass for tables not yet in Supabase types
const db = supabase as any;

// Query keys
export const guestKeys = {
  all: ['party-guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...guestKeys.lists(), filters] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (id: string) => [...guestKeys.details(), id] as const,
  byParty: (partyId: string) => [...guestKeys.all, 'party', partyId] as const,
  byEmail: (email: string) => [...guestKeys.all, 'email', email] as const,
};

// Fetch all guests for a party
export function usePartyGuests(partyId: string | undefined) {
  return useQuery({
    queryKey: guestKeys.byParty(partyId || ''),
    queryFn: async () => {
      if (!partyId) return [];

      const { data, error } = await db
        .from('party_guests')
        .select('*')
        .eq('party_id', partyId)
        .order('is_organizer', { ascending: false })
        .order('name');

      if (error) {
        console.error('Error fetching party guests:', error);
        throw error;
      }

      return data as PartyGuest[];
    },
    enabled: !!partyId,
  });
}

// Fetch a single guest by ID
export function usePartyGuest(id: string | undefined) {
  return useQuery({
    queryKey: guestKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await db
        .from('party_guests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching party guest:', error);
        throw error;
      }

      return data as PartyGuest;
    },
    enabled: !!id,
  });
}

// Find guest by email (for linking logged-in users)
export function useGuestByEmail(partyId: string | undefined, email: string | undefined) {
  return useQuery({
    queryKey: [...guestKeys.byParty(partyId || ''), 'email', email],
    queryFn: async () => {
      if (!partyId || !email) return null;

      const { data, error } = await db
        .from('party_guests')
        .select('*')
        .eq('party_id', partyId)
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching guest by email:', error);
        throw error;
      }

      return data as PartyGuest | null;
    },
    enabled: !!partyId && !!email,
  });
}

// Create a new guest
export function useCreatePartyGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guest: PartyGuestInsert) => {
      const { data, error } = await db
        .from('party_guests')
        .insert(guest)
        .select()
        .single();

      if (error) {
        console.error('Error creating party guest:', error);
        throw error;
      }

      return data as PartyGuest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success(`${data.name} added to guest list`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add guest: ${error.message}`);
    },
  });
}

// Bulk create guests (import from list)
export function useBulkCreateGuests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guests: PartyGuestInsert[]) => {
      const { data, error } = await db
        .from('party_guests')
        .insert(guests)
        .select();

      if (error) {
        console.error('Error creating guests:', error);
        throw error;
      }

      return data as PartyGuest[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success(`${data.length} guests added`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add guests: ${error.message}`);
    },
  });
}

// Update a guest
export function useUpdatePartyGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PartyGuestUpdate }) => {
      const { data, error } = await db
        .from('party_guests')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating party guest:', error);
        throw error;
      }

      return data as PartyGuest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success('Guest updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update guest: ${error.message}`);
    },
  });
}

// Update guest RSVP status
export function useUpdateGuestRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rsvpStatus }: { id: string; rsvpStatus: RSVPStatus }) => {
      const { data, error } = await db
        .from('party_guests')
        .update({
          rsvp_status: rsvpStatus,
          rsvp_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating RSVP:', error);
        throw error;
      }

      return data as PartyGuest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });

      const messages: Record<RSVPStatus, string> = {
        confirmed: 'RSVP confirmed!',
        declined: 'RSVP declined',
        maybe: 'RSVP marked as maybe',
        pending: 'RSVP reset to pending',
      };
      toast.success(messages[data.rsvp_status]);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update RSVP: ${error.message}`);
    },
  });
}

// Update guest payment status
export function useUpdateGuestPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
      amountPaid,
      paymentIntentId
    }: {
      id: string;
      paymentStatus: PaymentStatus;
      amountPaid?: number;
      paymentIntentId?: string;
    }) => {
      const updates: Partial<PartyGuest> = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (amountPaid !== undefined) {
        updates.amount_paid = amountPaid;
      }

      if (paymentIntentId) {
        updates.payment_intent_id = paymentIntentId;
      }

      if (paymentStatus === 'paid') {
        updates.paid_at = new Date().toISOString();
      }

      const { data, error } = await db
        .from('party_guests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating guest payment:', error);
        throw error;
      }

      return data as PartyGuest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });

      if (data.payment_status === 'paid') {
        toast.success(`Payment recorded for ${data.name}`);
      } else {
        toast.success('Payment status updated');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });
}

// Delete a guest
export function useDeletePartyGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from('party_guests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting party guest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success('Guest removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove guest: ${error.message}`);
    },
  });
}

// Get guest stats for a party
export function useGuestStats(partyId: string | undefined) {
  return useQuery({
    queryKey: [...guestKeys.byParty(partyId || ''), 'stats'],
    queryFn: async () => {
      if (!partyId) return null;

      const { data, error } = await db
        .from('party_guests')
        .select('rsvp_status, payment_status, amount_owed, amount_paid')
        .eq('party_id', partyId);

      if (error) {
        console.error('Error fetching guest stats:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        rsvp: {
          pending: data.filter(g => g.rsvp_status === 'pending').length,
          confirmed: data.filter(g => g.rsvp_status === 'confirmed').length,
          declined: data.filter(g => g.rsvp_status === 'declined').length,
          maybe: data.filter(g => g.rsvp_status === 'maybe').length,
        },
        payment: {
          unpaid: data.filter(g => g.payment_status === 'unpaid').length,
          partial: data.filter(g => g.payment_status === 'partial').length,
          paid: data.filter(g => g.payment_status === 'paid').length,
        },
        totalOwed: data.reduce((sum, g) => sum + (g.amount_owed || 0), 0),
        totalPaid: data.reduce((sum, g) => sum + (g.amount_paid || 0), 0),
      };

      return stats;
    },
    enabled: !!partyId,
  });
}

// Calculate per-guest cost
export function calculatePerGuestCost(
  totalAmount: number,
  guestCount: number
): number {
  if (guestCount <= 0) return 0;
  return Math.ceil(totalAmount / guestCount * 100) / 100; // Round up to nearest cent
}
