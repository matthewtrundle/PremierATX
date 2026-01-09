-- Add Share Token System to Parties
-- Enables VR partners to create personalized links for guests

-- ============================================================================
-- ADD SHARE TOKEN COLUMNS TO PARTIES TABLE
-- ============================================================================

-- Add share_token column for unique shareable links
ALTER TABLE public.parties
ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Add timestamp for when share token was created
ALTER TABLE public.parties
ADD COLUMN IF NOT EXISTS share_token_created_at TIMESTAMPTZ DEFAULT NOW();

-- Add party display name (what VR partner enters, e.g., "Sarah's Bachelorette")
-- Note: party_name already exists but we ensure it's used consistently
ALTER TABLE public.parties
ADD COLUMN IF NOT EXISTS created_by_partner BOOLEAN DEFAULT false;

-- Add partner notes (context VR partner provides about the party)
ALTER TABLE public.parties
ADD COLUMN IF NOT EXISTS partner_notes TEXT;

-- Create index for efficient share token lookups
CREATE INDEX IF NOT EXISTS idx_parties_share_token ON public.parties(share_token);

-- ============================================================================
-- RLS POLICY FOR PUBLIC PARTY ACCESS VIA SHARE TOKEN
-- ============================================================================

-- Allow public read access to parties via share token (no auth required)
-- This enables guests to view their party page without logging in
CREATE POLICY "Anyone can view party via share token" ON public.parties
  FOR SELECT USING (share_token IS NOT NULL);

-- Allow public to view party bookings for shared parties
CREATE POLICY "Anyone can view bookings for shared parties" ON public.party_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parties
      WHERE parties.id = party_bookings.party_id
      AND parties.share_token IS NOT NULL
    )
  );

-- Allow public to view guest list for shared parties (for RSVP display)
CREATE POLICY "Anyone can view guests for shared parties" ON public.party_guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parties
      WHERE parties.id = party_guests.party_id
      AND parties.share_token IS NOT NULL
    )
  );

-- ============================================================================
-- HELPER FUNCTION: LOOKUP PARTY BY SHARE TOKEN
-- ============================================================================

CREATE OR REPLACE FUNCTION get_party_by_share_token(p_token UUID)
RETURNS SETOF public.parties AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.parties
  WHERE share_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_party_by_share_token(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_party_by_share_token(UUID) TO authenticated;

-- ============================================================================
-- HELPER FUNCTION: GET FULL PARTY DATA BY SHARE TOKEN
-- Returns party with partner branding info
-- ============================================================================

CREATE OR REPLACE FUNCTION get_party_with_partner_by_token(p_token UUID)
RETURNS TABLE (
  party_id UUID,
  party_name TEXT,
  party_type TEXT,
  honoree_name TEXT,
  party_date DATE,
  party_end_date DATE,
  guest_count INTEGER,
  budget_range TEXT,
  location TEXT,
  preferences JSONB,
  status TEXT,
  partner_id UUID,
  partner_name TEXT,
  partner_slug TEXT,
  partner_branding JSONB,
  partner_logo TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as party_id,
    p.party_name,
    p.party_type,
    p.honoree_name,
    p.party_date,
    p.party_end_date,
    p.guest_count,
    p.budget_range,
    p.location,
    p.preferences,
    p.status,
    vr.id as partner_id,
    vr.name as partner_name,
    vr.slug as partner_slug,
    vr.branding_config as partner_branding,
    vr.logo_url as partner_logo
  FROM public.parties p
  LEFT JOIN public.vr_partners vr ON p.vr_partner_id = vr.id
  WHERE p.share_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_party_with_partner_by_token(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_party_with_partner_by_token(UUID) TO authenticated;

-- ============================================================================
-- UPDATE EXISTING PARTIES WITH SHARE TOKENS
-- ============================================================================

-- Generate share tokens for any existing parties that don't have one
UPDATE public.parties
SET share_token = gen_random_uuid()
WHERE share_token IS NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN public.parties.share_token IS 'Unique token for shareable party links (e.g., /p/{token})';
COMMENT ON COLUMN public.parties.share_token_created_at IS 'When the share token was generated';
COMMENT ON COLUMN public.parties.created_by_partner IS 'Whether this party was created by a VR partner (vs self-serve)';
COMMENT ON COLUMN public.parties.partner_notes IS 'Notes from VR partner about the party (e.g., "They mentioned wanting lake activities")';
COMMENT ON FUNCTION get_party_by_share_token IS 'Lookup party by its share token for public access';
COMMENT ON FUNCTION get_party_with_partner_by_token IS 'Get full party data with partner branding by share token';
