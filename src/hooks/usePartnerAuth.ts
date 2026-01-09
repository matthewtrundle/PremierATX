// Partner Authentication Hook
// Handles authentication flow for VR Partners using Supabase Auth

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VRPartner } from '@/types/partyPlanning';
import { toast } from 'sonner';

// Types
export interface PartnerSession {
  user: {
    id: string;
    email: string;
  } | null;
  partner: VRPartner | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPartner: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  partnerName: string;
  phone?: string;
}

// Query keys
export const partnerAuthKeys = {
  session: ['partner-session'] as const,
  partner: ['current-partner'] as const,
};

// Hook to get current partner session
export function usePartnerSession() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<PartnerSession['user']>(null);

  // Get current session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the partner record for the authenticated user
  const { data: partner, isLoading: partnerLoading } = useQuery({
    queryKey: partnerAuthKeys.partner,
    queryFn: async () => {
      if (!user?.email) return null;

      const client = supabase as any;
      const { data, error } = await client
        .from('vr_partners')
        .select('*')
        .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No partner found - user is not a partner
          return null;
        }
        console.error('Error fetching partner:', error);
        throw error;
      }

      return data as VRPartner;
    },
    enabled: !!user?.email,
    retry: false,
  });

  return {
    user,
    partner: partner || null,
    isLoading: isLoading || partnerLoading,
    isAuthenticated: !!user,
    isPartner: !!partner,
  };
}

// Hook for partner login
export function usePartnerLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const client = supabase as any;
      // First, check if this email belongs to a partner
      const { data: partnerCheck } = await client
        .from('vr_partners')
        .select('id, name, is_active')
        .eq('email', email)
        .single();

      if (!partnerCheck) {
        throw new Error('No partner account found with this email. Please contact support.');
      }

      if (!partnerCheck.is_active) {
        throw new Error('This partner account is inactive. Please contact support.');
      }

      // Proceed with Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Link partner to auth user if not already linked
      await client
        .from('vr_partners')
        .update({ auth_user_id: data.user.id })
        .eq('email', email)
        .is('auth_user_id', null);

      return {
        user: data.user,
        partnerId: partnerCheck.id,
        partnerName: partnerCheck.name,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerAuthKeys.partner });
      toast.success(`Welcome back, ${data.partnerName}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook for partner signup (typically admin-initiated, but supports self-service)
export function usePartnerSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, partnerName, phone }: SignupData) => {
      const client = supabase as any;
      // First, create the Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'partner',
            partner_name: partnerName,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Check if partner record already exists
      const { data: existingPartner } = await client
        .from('vr_partners')
        .select('id')
        .eq('email', email)
        .single();

      if (existingPartner) {
        // Link existing partner to auth user
        await client
          .from('vr_partners')
          .update({ auth_user_id: authData.user.id })
          .eq('id', existingPartner.id);

        return {
          user: authData.user,
          partnerId: existingPartner.id,
          partnerName,
          isNew: false,
        };
      }

      // Create new partner record
      const slug = partnerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);

      const { data: partner, error: partnerError } = await client
        .from('vr_partners')
        .insert({
          name: partnerName,
          slug,
          email,
          phone,
          auth_user_id: authData.user.id,
          is_active: true,
          is_demo: false,
        })
        .select()
        .single();

      if (partnerError) {
        // Clean up auth user if partner creation fails
        console.error('Failed to create partner record:', partnerError);
        throw new Error('Failed to create partner account. Please contact support.');
      }

      return {
        user: authData.user,
        partnerId: partner.id,
        partnerName,
        isNew: true,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerAuthKeys.partner });
      toast.success(
        data.isNew
          ? `Welcome to PremierATX, ${data.partnerName}!`
          : `Account linked successfully!`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook for partner logout
export function usePartnerLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerAuthKeys.partner });
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to log out: ${error.message}`);
    },
  });
}

// Hook for password reset
export function usePartnerPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const client = supabase as any;
      // Verify this is a partner email
      const { data: partnerCheck } = await client
        .from('vr_partners')
        .select('id')
        .eq('email', email)
        .single();

      if (!partnerCheck) {
        throw new Error('No partner account found with this email.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/partner-portal/reset-password`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
