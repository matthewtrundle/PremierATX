-- Partner Authentication Schema
-- Adds authentication support for VR Partners via Supabase Auth

-- ============================================================================
-- ADD AUTH USER ID TO VR PARTNERS
-- Links partner accounts to Supabase Auth users
-- ============================================================================

-- Add auth_user_id column to link partners to Supabase Auth
ALTER TABLE public.vr_partners
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Create index for auth lookups
CREATE INDEX IF NOT EXISTS idx_vr_partners_auth_user ON public.vr_partners(auth_user_id);

-- ============================================================================
-- RLS POLICIES FOR PARTNER SELF-SERVICE
-- ============================================================================

-- Partners can view and update their own record
CREATE POLICY "Partners can view their own record" ON public.vr_partners
  FOR SELECT USING (
    auth_user_id = auth.uid() OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Partners can update their own record" ON public.vr_partners
  FOR UPDATE USING (
    auth_user_id = auth.uid() OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    auth_user_id = auth.uid() OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Partners can view and manage parties they created
CREATE POLICY "Partners can view parties they created" ON public.parties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vr_partners
      WHERE vr_partners.id = parties.vr_partner_id
      AND (vr_partners.auth_user_id = auth.uid() OR vr_partners.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Partners can create parties for their guests" ON public.parties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vr_partners
      WHERE vr_partners.id = parties.vr_partner_id
      AND (vr_partners.auth_user_id = auth.uid() OR vr_partners.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Partners can update parties they created" ON public.parties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.vr_partners
      WHERE vr_partners.id = parties.vr_partner_id
      AND (vr_partners.auth_user_id = auth.uid() OR vr_partners.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Partners can view their own analytics
CREATE POLICY "Partners can view their analytics" ON public.partner_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vr_partners
      WHERE vr_partners.id = partner_analytics.vr_partner_id
      AND (vr_partners.auth_user_id = auth.uid() OR vr_partners.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR PARTNER AUTH
-- ============================================================================

-- Function to get current partner from auth session
CREATE OR REPLACE FUNCTION get_current_partner()
RETURNS public.vr_partners AS $$
DECLARE
  partner public.vr_partners;
  user_email TEXT;
BEGIN
  -- Get the email of the authenticated user
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  -- Find partner by auth_user_id or email
  SELECT * INTO partner
  FROM public.vr_partners
  WHERE auth_user_id = auth.uid() OR email = user_email
  LIMIT 1;

  RETURN partner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link partner to auth user after login
CREATE OR REPLACE FUNCTION link_partner_to_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user logs in, link their account to partner if email matches
  UPDATE public.vr_partners
  SET auth_user_id = NEW.id
  WHERE email = NEW.email AND auth_user_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-link partners on user creation
DROP TRIGGER IF EXISTS trigger_link_partner_on_signup ON auth.users;
CREATE TRIGGER trigger_link_partner_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_partner_to_auth_user();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_current_partner() TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN public.vr_partners.auth_user_id IS 'Links partner to Supabase Auth user for authentication';
COMMENT ON FUNCTION get_current_partner IS 'Returns the VR Partner record for the currently authenticated user';
