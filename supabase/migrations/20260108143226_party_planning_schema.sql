-- Party Planning Platform Schema Migration
-- Transforms the delivery platform into a bachelor/bachelorette party planning platform
-- with VR (vacation rental) partnerships

-- ============================================================================
-- VR PARTNERS TABLE (B2B Customers)
-- These are vacation rental companies that use our platform
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vr_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  -- Branding configuration for their white-label storefront
  branding_config JSONB DEFAULT '{
    "primary_color": "#d4af37",
    "secondary_color": "#1a1a1a",
    "font_family": "Inter",
    "tagline": "Plan Your Perfect Party"
  }'::jsonb,
  -- Their commission rate on bookings made through their storefront
  commission_rate NUMERIC DEFAULT 10,
  -- Subscription tier: 'basic', 'pro', 'enterprise'
  subscription_tier TEXT DEFAULT 'basic',
  -- Monthly subscription amount in cents
  subscription_amount INTEGER DEFAULT 9900,
  -- Stripe customer ID for billing
  stripe_customer_id TEXT,
  -- Custom subdomain: [slug].partyplanwithus.com
  custom_domain TEXT,
  is_active BOOLEAN DEFAULT true,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for subdomain routing
CREATE INDEX IF NOT EXISTS idx_vr_partners_slug ON public.vr_partners(slug);
CREATE INDEX IF NOT EXISTS idx_vr_partners_active ON public.vr_partners(is_active) WHERE is_active = true;

-- ============================================================================
-- SERVICE VENDORS TABLE (Supply Side)
-- These are the activity providers, caterers, DJs, etc.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  -- Vendor types: 'catering', 'dj', 'photography', 'activities', 'transportation', 'vr_rental', 'spa', 'tours'
  vendor_type TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  -- Service areas (cities they operate in)
  service_area TEXT[] DEFAULT ARRAY['austin'],
  -- Contact information
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  -- Business details
  business_address TEXT,
  -- Pricing model: 'wholesale' (we get net rate), 'affiliate' (commission), 'direct' (pass-through)
  pricing_model TEXT DEFAULT 'wholesale',
  -- For wholesale model: % off retail they give us (e.g., 15 = 15% off retail)
  wholesale_discount_pct NUMERIC DEFAULT 15,
  -- For affiliate model: % commission we earn
  affiliate_commission_pct NUMERIC DEFAULT 10,
  -- Minimum group size for group rates
  min_group_size INTEGER DEFAULT 6,
  -- Operating hours (JSONB for flexibility)
  operating_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "22:00"},
    "tuesday": {"open": "09:00", "close": "22:00"},
    "wednesday": {"open": "09:00", "close": "22:00"},
    "thursday": {"open": "09:00", "close": "22:00"},
    "friday": {"open": "09:00", "close": "23:00"},
    "saturday": {"open": "10:00", "close": "23:00"},
    "sunday": {"open": "10:00", "close": "21:00"}
  }'::jsonb,
  -- Availability configuration
  availability_config JSONB DEFAULT '{"advance_booking_days": 90, "min_notice_hours": 24}'::jsonb,
  -- Rating (1-5 scale, calculated from reviews)
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  -- Featured vendor (premium placement)
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for vendor search
CREATE INDEX IF NOT EXISTS idx_service_vendors_type ON public.service_vendors(vendor_type);
CREATE INDEX IF NOT EXISTS idx_service_vendors_area ON public.service_vendors USING GIN(service_area);
CREATE INDEX IF NOT EXISTS idx_service_vendors_active ON public.service_vendors(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_vendors_featured ON public.service_vendors(is_featured) WHERE is_featured = true;

-- ============================================================================
-- SERVICE PACKAGES TABLE (Vendor Offerings)
-- Each vendor can have multiple service packages at different price points
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.service_vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  -- Three-tier pricing for wholesale model
  retail_price NUMERIC NOT NULL,        -- What vendor normally charges public
  net_price NUMERIC NOT NULL,           -- What we pay vendor (wholesale)
  guest_price NUMERIC NOT NULL,         -- What guests pay (between net and retail)
  -- Example: Retail=$100, Net=$80 (20% wholesale discount), Guest=$90 (10% savings shown)
  -- Platform margin = $90 - $80 = $10 per booking

  -- Pricing type: 'fixed', 'per_person', 'hourly'
  price_type TEXT DEFAULT 'fixed',
  -- Guest constraints
  min_guests INTEGER,
  max_guests INTEGER,
  -- Duration in hours (for time-based services)
  duration_hours NUMERIC,
  -- Package images
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Features/inclusions list
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- What's included (detailed description)
  whats_included TEXT,
  -- What to expect
  what_to_expect TEXT,
  -- Cancellation policy
  cancellation_policy TEXT DEFAULT '48 hours notice required for full refund',
  -- Display order for sorting
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_vendor ON public.service_packages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_active ON public.service_packages(is_active) WHERE is_active = true;

-- ============================================================================
-- PARTIES TABLE (Core Entity)
-- Represents a bachelor/bachelorette party being planned
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Which VR partner referred this party (nullable if direct)
  vr_partner_id UUID REFERENCES public.vr_partners(id),
  -- Party organizer information
  organizer_email TEXT NOT NULL,
  organizer_name TEXT,
  organizer_phone TEXT,
  organizer_user_id UUID REFERENCES auth.users(id),
  -- Party details
  party_type TEXT NOT NULL CHECK (party_type IN ('bachelor', 'bachelorette', 'other')),
  party_name TEXT, -- e.g., "Sarah's Bachelorette Bash"
  honoree_name TEXT, -- The bride/groom being celebrated
  party_date DATE NOT NULL,
  party_end_date DATE, -- For multi-day parties
  guest_count INTEGER NOT NULL,
  -- Budget range: 'budget' (<$1000), 'moderate' ($1000-3000), 'premium' ($3000-5000), 'luxury' ($5000+)
  budget_range TEXT DEFAULT 'moderate',
  -- Location
  location TEXT DEFAULT 'Austin, TX',
  venue_address TEXT, -- Specific venue/rental address
  -- Party preferences (for AI recommendations)
  preferences JSONB DEFAULT '{
    "vibe": [],
    "activities": [],
    "dietary_restrictions": [],
    "must_haves": [],
    "avoid": []
  }'::jsonb,
  special_requests TEXT,
  -- Party status
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'booked', 'confirmed', 'completed', 'cancelled')),
  -- AI recommendations (populated by AI planner)
  ai_recommendations JSONB,
  -- Totals (calculated)
  subtotal NUMERIC DEFAULT 0,
  total_savings NUMERIC DEFAULT 0, -- Sum of (retail - guest_price) across bookings
  total_amount NUMERIC DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parties_vr_partner ON public.parties(vr_partner_id);
CREATE INDEX IF NOT EXISTS idx_parties_organizer_email ON public.parties(organizer_email);
CREATE INDEX IF NOT EXISTS idx_parties_status ON public.parties(status);
CREATE INDEX IF NOT EXISTS idx_parties_date ON public.parties(party_date);

-- ============================================================================
-- PARTY BOOKINGS TABLE (Vendor Selections)
-- Links parties to the services they've booked
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.party_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.service_vendors(id),
  package_id UUID REFERENCES public.service_packages(id),
  -- Service scheduling
  service_date DATE NOT NULL,
  service_time_start TIME,
  service_time_end TIME,
  -- Guest count for this specific service
  guest_count INTEGER,
  -- Financial breakdown (wholesale model)
  retail_value NUMERIC,                 -- Original retail price (for "savings" display)
  guest_pays NUMERIC NOT NULL,          -- What party pays (discounted rate)
  vendor_receives NUMERIC NOT NULL,     -- What we pay vendor (net rate)
  platform_margin NUMERIC NOT NULL,     -- Our spread (guest_pays - vendor_receives)
  -- Booking status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled', 'refunded')),
  -- Payment tracking
  payment_intent_id TEXT, -- Stripe payment intent
  paid_at TIMESTAMPTZ,
  -- Vendor communication
  vendor_notes TEXT,
  confirmation_code TEXT,
  -- Special requests for this specific booking
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_party_bookings_party ON public.party_bookings(party_id);
CREATE INDEX IF NOT EXISTS idx_party_bookings_vendor ON public.party_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_party_bookings_status ON public.party_bookings(status);
CREATE INDEX IF NOT EXISTS idx_party_bookings_date ON public.party_bookings(service_date);

-- ============================================================================
-- PARTY GUESTS TABLE
-- Track RSVPs and payment collection from party attendees
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.party_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  -- Guest information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  user_id UUID REFERENCES auth.users(id),
  -- RSVP status
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe')),
  rsvp_at TIMESTAMPTZ,
  -- Payment tracking (for split payments)
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  amount_owed NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  -- Guest preferences/dietary restrictions
  dietary_restrictions TEXT[],
  notes TEXT,
  -- Is this the organizer?
  is_organizer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_party_guests_party ON public.party_guests(party_id);
CREATE INDEX IF NOT EXISTS idx_party_guests_email ON public.party_guests(email);
CREATE INDEX IF NOT EXISTS idx_party_guests_rsvp ON public.party_guests(rsvp_status);

-- ============================================================================
-- AI PLANNING SESSIONS TABLE
-- Store AI chat history and recommendations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_planning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE,
  -- User who initiated the session (if logged in)
  user_id UUID REFERENCES auth.users(id),
  -- Chat messages history
  messages JSONB DEFAULT '[]'::jsonb,
  -- AI-generated recommendations
  recommendations JSONB DEFAULT '{
    "vendors": [],
    "itinerary": [],
    "budget_breakdown": {},
    "tips": []
  }'::jsonb,
  -- Session metadata
  context JSONB DEFAULT '{}'::jsonb, -- Party context used for recommendations
  model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used INTEGER DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_sessions_party ON public.ai_planning_sessions(party_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON public.ai_planning_sessions(user_id);

-- ============================================================================
-- VENDOR REVIEWS TABLE
-- Reviews from party organizers about vendors
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.service_vendors(id) ON DELETE CASCADE,
  party_id UUID REFERENCES public.parties(id),
  booking_id UUID REFERENCES public.party_bookings(id),
  -- Reviewer info
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  user_id UUID REFERENCES auth.users(id),
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  -- Review metadata
  is_verified BOOLEAN DEFAULT false, -- Did they actually book through us?
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor ON public.vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON public.vendor_reviews(rating);

-- ============================================================================
-- PARTNER ANALYTICS TABLE
-- Track performance metrics for VR partners
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.partner_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_partner_id UUID NOT NULL REFERENCES public.vr_partners(id) ON DELETE CASCADE,
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- Metrics
  parties_created INTEGER DEFAULT 0,
  parties_booked INTEGER DEFAULT 0,
  total_gmv NUMERIC DEFAULT 0,           -- Gross merchandise value
  total_commission NUMERIC DEFAULT 0,     -- Commission earned
  unique_visitors INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  -- Breakdown by vendor type
  bookings_by_type JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner ON public.partner_analytics(vr_partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_period ON public.partner_analytics(period_start, period_end);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.vr_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_planning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_analytics ENABLE ROW LEVEL SECURITY;

-- VR Partners: Public read for active partners, admin write
CREATE POLICY "VR partners are viewable by everyone" ON public.vr_partners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage VR partners" ON public.vr_partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Service Vendors: Public read for active vendors
CREATE POLICY "Service vendors are viewable by everyone" ON public.service_vendors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage service vendors" ON public.service_vendors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Service Packages: Public read for active packages
CREATE POLICY "Service packages are viewable by everyone" ON public.service_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage service packages" ON public.service_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Parties: Users can manage their own parties
CREATE POLICY "Users can view their own parties" ON public.parties
  FOR SELECT USING (
    organizer_user_id = auth.uid() OR
    organizer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create parties" ON public.parties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own parties" ON public.parties
  FOR UPDATE USING (
    organizer_user_id = auth.uid() OR
    organizer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can manage all parties" ON public.parties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Party Bookings: Accessible to party organizers
CREATE POLICY "Users can view bookings for their parties" ON public.party_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parties
      WHERE parties.id = party_bookings.party_id
      AND (parties.organizer_user_id = auth.uid() OR parties.organizer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Users can manage bookings for their parties" ON public.party_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.parties
      WHERE parties.id = party_bookings.party_id
      AND (parties.organizer_user_id = auth.uid() OR parties.organizer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Party Guests: Accessible to party organizers and the guests themselves
CREATE POLICY "Users can view guests for their parties" ON public.party_guests
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.parties
      WHERE parties.id = party_guests.party_id
      AND (parties.organizer_user_id = auth.uid() OR parties.organizer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Party organizers can manage guests" ON public.party_guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.parties
      WHERE parties.id = party_guests.party_id
      AND (parties.organizer_user_id = auth.uid() OR parties.organizer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- AI Planning Sessions: Users can manage their own sessions
CREATE POLICY "Users can manage their AI sessions" ON public.ai_planning_sessions
  FOR ALL USING (user_id = auth.uid());

-- Vendor Reviews: Public read, authenticated write
CREATE POLICY "Reviews are viewable by everyone" ON public.vendor_reviews
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can create reviews" ON public.vendor_reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Partner Analytics: Only accessible to the partner and admins
CREATE POLICY "Partners can view their own analytics" ON public.partner_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vr_partners
      WHERE vr_partners.id = partner_analytics.vr_partner_id
      AND vr_partners.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admin can view all analytics" ON public.partner_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update vendor rating when a review is added
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.service_vendors
  SET
    rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.vendor_reviews WHERE vendor_id = NEW.vendor_id AND is_published = true),
    review_count = (SELECT COUNT(*) FROM public.vendor_reviews WHERE vendor_id = NEW.vendor_id AND is_published = true)
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vendor rating
DROP TRIGGER IF EXISTS trigger_update_vendor_rating ON public.vendor_reviews;
CREATE TRIGGER trigger_update_vendor_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_rating();

-- Function to calculate party totals
CREATE OR REPLACE FUNCTION update_party_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.parties
  SET
    subtotal = (SELECT COALESCE(SUM(guest_pays), 0) FROM public.party_bookings WHERE party_id = COALESCE(NEW.party_id, OLD.party_id) AND status != 'cancelled'),
    total_savings = (SELECT COALESCE(SUM(retail_value - guest_pays), 0) FROM public.party_bookings WHERE party_id = COALESCE(NEW.party_id, OLD.party_id) AND status != 'cancelled' AND retail_value IS NOT NULL),
    total_amount = (SELECT COALESCE(SUM(guest_pays), 0) FROM public.party_bookings WHERE party_id = COALESCE(NEW.party_id, OLD.party_id) AND status != 'cancelled'),
    updated_at = now()
  WHERE id = COALESCE(NEW.party_id, OLD.party_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update party totals
DROP TRIGGER IF EXISTS trigger_update_party_totals ON public.party_bookings;
CREATE TRIGGER trigger_update_party_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.party_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_party_totals();

-- ============================================================================
-- SEED DATA: Demo VR Partners
-- ============================================================================
INSERT INTO public.vr_partners (name, slug, email, phone, logo_url, branding_config, is_demo, is_active)
VALUES
  (
    'Luxury Lake Retreats',
    'demo-luxury',
    'demo@luxurylakeretreats.com',
    '512-555-0101',
    NULL,
    '{
      "primary_color": "#d4af37",
      "secondary_color": "#1a1a1a",
      "font_family": "Playfair Display",
      "tagline": "Where Luxury Meets Lakeside Living",
      "hero_image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
      "description": "Premium vacation rentals on Lake Travis"
    }'::jsonb,
    true,
    true
  ),
  (
    'Hill Country Hideaways',
    'demo-lakehouse',
    'demo@hillcountryhideaways.com',
    '512-555-0102',
    NULL,
    '{
      "primary_color": "#2d5a4a",
      "secondary_color": "#f5f5dc",
      "font_family": "Montserrat",
      "tagline": "Your Texas Hill Country Escape",
      "hero_image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      "description": "Charming vacation homes in the heart of Texas Hill Country"
    }'::jsonb,
    true,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.vr_partners IS 'Vacation rental companies that use our platform (B2B customers)';
COMMENT ON TABLE public.service_vendors IS 'Activity providers, caterers, DJs, etc. (supply side)';
COMMENT ON TABLE public.service_packages IS 'Service offerings from vendors at different price points';
COMMENT ON TABLE public.parties IS 'Bachelor/bachelorette parties being planned';
COMMENT ON TABLE public.party_bookings IS 'Services booked for each party';
COMMENT ON TABLE public.party_guests IS 'Attendees for each party with RSVP and payment tracking';
COMMENT ON TABLE public.ai_planning_sessions IS 'AI chat history and recommendations';
COMMENT ON TABLE public.vendor_reviews IS 'Reviews from party organizers about vendors';
COMMENT ON TABLE public.partner_analytics IS 'Performance metrics for VR partners';
