// Party Bookings CRUD Hooks
// Manages vendor bookings for parties

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PartyBooking,
  PartyBookingInsert,
  PartyBookingUpdate,
  BookingStatus
} from '@/types/partyPlanning';
import { toast } from 'sonner';
import { partyKeys } from './useParties';

// Query keys
export const bookingKeys = {
  all: ['party-bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  byParty: (partyId: string) => [...bookingKeys.all, 'party', partyId] as const,
  byVendor: (vendorId: string) => [...bookingKeys.all, 'vendor', vendorId] as const,
};

// Fetch all bookings for a party
export function usePartyBookings(partyId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.byParty(partyId || ''),
    queryFn: async () => {
      if (!partyId) return [];

      const { data, error } = await supabase
        .from('party_bookings')
        .select(`
          *,
          vendor:service_vendors(*),
          package:service_packages(*)
        `)
        .eq('party_id', partyId)
        .order('service_date')
        .order('service_time_start');

      if (error) {
        console.error('Error fetching party bookings:', error);
        throw error;
      }

      return data as PartyBooking[];
    },
    enabled: !!partyId,
  });
}

// Fetch a single booking by ID
export function usePartyBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('party_bookings')
        .select(`
          *,
          vendor:service_vendors(*),
          package:service_packages(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching party booking:', error);
        throw error;
      }

      return data as PartyBooking;
    },
    enabled: !!id,
  });
}

// Fetch bookings for a vendor (vendor dashboard)
export function useBookingsByVendor(vendorId: string | undefined, options?: {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...bookingKeys.byVendor(vendorId || ''), options],
    queryFn: async () => {
      if (!vendorId) return [];

      let query = supabase
        .from('party_bookings')
        .select(`
          *,
          party:parties(id, party_name, organizer_name, organizer_email, organizer_phone, guest_count)
        `)
        .eq('vendor_id', vendorId)
        .order('service_date');

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.startDate) {
        query = query.gte('service_date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('service_date', options.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings by vendor:', error);
        throw error;
      }

      return data;
    },
    enabled: !!vendorId,
  });
}

// Create a new booking
export function useCreatePartyBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: PartyBookingInsert) => {
      const { data, error } = await supabase
        .from('party_bookings')
        .insert(booking)
        .select(`
          *,
          vendor:service_vendors(name),
          package:service_packages(name)
        `)
        .single();

      if (error) {
        console.error('Error creating party booking:', error);
        throw error;
      }

      return data as PartyBooking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success(`Booking added: ${data.vendor?.name || 'Vendor'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create booking: ${error.message}`);
    },
  });
}

// Update a booking
export function useUpdatePartyBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PartyBookingUpdate }) => {
      const { data, error } = await supabase
        .from('party_bookings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating party booking:', error);
        throw error;
      }

      return data as PartyBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success('Booking updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking: ${error.message}`);
    },
  });
}

// Update booking status
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, confirmationCode }: {
      id: string;
      status: BookingStatus;
      confirmationCode?: string;
    }) => {
      const updates: PartyBookingUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (confirmationCode) {
        updates.confirmation_code = confirmationCode;
      }

      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('party_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking status:', error);
        throw error;
      }

      return data as PartyBooking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success(`Booking status updated to ${data.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking status: ${error.message}`);
    },
  });
}

// Delete a booking
export function useDeletePartyBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('party_bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting party booking:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success('Booking removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove booking: ${error.message}`);
    },
  });
}

// Cancel a booking
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('party_bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling booking:', error);
        throw error;
      }

      return data as PartyBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success('Booking cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel booking: ${error.message}`);
    },
  });
}

// Bulk create bookings (for cart checkout)
export function useBulkCreateBookings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookings: PartyBookingInsert[]) => {
      const { data, error } = await supabase
        .from('party_bookings')
        .insert(bookings)
        .select();

      if (error) {
        console.error('Error creating bookings:', error);
        throw error;
      }

      return data as PartyBooking[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      toast.success(`${data.length} bookings created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bookings: ${error.message}`);
    },
  });
}

// Generate confirmation code
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
