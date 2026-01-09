// Party Planning Platform Types
// These types represent the new party planning domain model

import { Json } from '@/integrations/supabase/types';

// ============================================================================
// VR Partners (B2B Customers)
// ============================================================================

export interface VRPartnerBrandingConfig {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  tagline: string;
  hero_image?: string;
  description?: string;
  logo_position?: 'left' | 'center' | 'right';
  custom_css?: string;
}

export interface VRPartner {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  logo_url?: string;
  branding_config: VRPartnerBrandingConfig;
  commission_rate: number;
  subscription_tier: 'basic' | 'pro' | 'enterprise';
  subscription_amount: number;
  stripe_customer_id?: string;
  custom_domain?: string;
  auth_user_id?: string;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface VRPartnerInsert {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  logo_url?: string;
  branding_config?: VRPartnerBrandingConfig;
  commission_rate?: number;
  subscription_tier?: 'basic' | 'pro' | 'enterprise';
  subscription_amount?: number;
  stripe_customer_id?: string;
  custom_domain?: string;
  is_active?: boolean;
  is_demo?: boolean;
}

export interface VRPartnerUpdate extends Partial<VRPartnerInsert> {}

// ============================================================================
// Service Vendors (Supply Side)
// ============================================================================

export type VendorType =
  | 'catering'
  | 'dj'
  | 'photography'
  | 'activities'
  | 'transportation'
  | 'vr_rental'
  | 'spa'
  | 'tours'
  | 'entertainment'
  | 'decor';

export type PricingModel = 'wholesale' | 'affiliate' | 'direct';

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
  } | { closed: true };
}

export interface AvailabilityConfig {
  advance_booking_days: number;
  min_notice_hours: number;
  blocked_dates?: string[];
}

export interface ServiceVendor {
  id: string;
  name: string;
  slug: string;
  vendor_type: VendorType;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  service_area: string[];
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  business_address?: string;
  pricing_model: PricingModel;
  wholesale_discount_pct: number;
  affiliate_commission_pct?: number;
  min_group_size: number;
  operating_hours: OperatingHours;
  availability_config: AvailabilityConfig;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceVendorInsert {
  name: string;
  slug: string;
  vendor_type: VendorType;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  service_area?: string[];
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  business_address?: string;
  pricing_model?: PricingModel;
  wholesale_discount_pct?: number;
  affiliate_commission_pct?: number;
  min_group_size?: number;
  operating_hours?: OperatingHours;
  availability_config?: AvailabilityConfig;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface ServiceVendorUpdate extends Partial<ServiceVendorInsert> {}

// ============================================================================
// Service Packages (Vendor Offerings)
// ============================================================================

export type PriceType = 'fixed' | 'per_person' | 'hourly';

export interface ServicePackage {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  // Three-tier pricing
  retail_price: number;
  net_price: number;
  guest_price: number;
  price_type: PriceType;
  min_guests?: number;
  max_guests?: number;
  duration_hours?: number;
  images: string[];
  features: string[];
  whats_included?: string;
  what_to_expect?: string;
  cancellation_policy: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  vendor?: ServiceVendor;
}

export interface ServicePackageInsert {
  vendor_id: string;
  name: string;
  description?: string;
  retail_price: number;
  net_price: number;
  guest_price: number;
  price_type?: PriceType;
  min_guests?: number;
  max_guests?: number;
  duration_hours?: number;
  images?: string[];
  features?: string[];
  whats_included?: string;
  what_to_expect?: string;
  cancellation_policy?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface ServicePackageUpdate extends Partial<ServicePackageInsert> {}

// ============================================================================
// Parties (Core Entity)
// ============================================================================

export type PartyType = 'bachelor' | 'bachelorette' | 'other';
export type BudgetRange = 'budget' | 'moderate' | 'premium' | 'luxury';
export type PartyStatus = 'planning' | 'booked' | 'confirmed' | 'completed' | 'cancelled';

export interface PartyPreferences {
  vibe: string[];
  activities: string[];
  dietary_restrictions: string[];
  must_haves: string[];
  avoid: string[];
}

export interface AIRecommendations {
  vendors: {
    vendor_id: string;
    reason: string;
    confidence: number;
  }[];
  itinerary: {
    time: string;
    activity: string;
    vendor_id?: string;
    notes?: string;
  }[];
  budget_breakdown: {
    category: string;
    amount: number;
  }[];
  tips: string[];
}

export interface Party {
  id: string;
  vr_partner_id?: string;
  organizer_email: string;
  organizer_name?: string;
  organizer_phone?: string;
  organizer_user_id?: string;
  party_type: PartyType;
  party_name?: string;
  honoree_name?: string;
  party_date: string;
  party_end_date?: string;
  guest_count: number;
  budget_range: BudgetRange;
  location: string;
  venue_address?: string;
  preferences: PartyPreferences;
  special_requests?: string;
  status: PartyStatus;
  ai_recommendations?: AIRecommendations;
  subtotal: number;
  total_savings: number;
  total_amount: number;
  // Share token system (for personalized party links)
  share_token?: string;
  share_token_created_at?: string;
  created_by_partner?: boolean;
  partner_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  vr_partner?: VRPartner;
  bookings?: PartyBooking[];
  guests?: PartyGuest[];
}

export interface PartyInsert {
  vr_partner_id?: string;
  organizer_email: string;
  organizer_name?: string;
  organizer_phone?: string;
  organizer_user_id?: string;
  party_type: PartyType;
  party_name?: string;
  honoree_name?: string;
  party_date: string;
  party_end_date?: string;
  guest_count: number;
  budget_range?: BudgetRange;
  location?: string;
  venue_address?: string;
  preferences?: PartyPreferences;
  special_requests?: string;
  status?: PartyStatus;
  // Share token system (for personalized party links)
  created_by_partner?: boolean;
  partner_notes?: string;
}

export interface PartyUpdate extends Partial<PartyInsert> {}

// ============================================================================
// Party Bookings (Vendor Selections)
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled' | 'refunded';

export interface PartyBooking {
  id: string;
  party_id: string;
  vendor_id: string;
  package_id?: string;
  service_date: string;
  service_time_start?: string;
  service_time_end?: string;
  guest_count?: number;
  // Financial breakdown
  retail_value?: number;
  guest_pays: number;
  vendor_receives: number;
  platform_margin: number;
  status: BookingStatus;
  payment_intent_id?: string;
  paid_at?: string;
  vendor_notes?: string;
  confirmation_code?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  vendor?: ServiceVendor;
  package?: ServicePackage;
}

export interface PartyBookingInsert {
  party_id: string;
  vendor_id: string;
  package_id?: string;
  service_date: string;
  service_time_start?: string;
  service_time_end?: string;
  guest_count?: number;
  retail_value?: number;
  guest_pays: number;
  vendor_receives: number;
  platform_margin: number;
  status?: BookingStatus;
  vendor_notes?: string;
  special_requests?: string;
}

export interface PartyBookingUpdate extends Partial<PartyBookingInsert> {}

// ============================================================================
// Party Guests
// ============================================================================

export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface PartyGuest {
  id: string;
  party_id: string;
  name: string;
  email?: string;
  phone?: string;
  user_id?: string;
  rsvp_status: RSVPStatus;
  rsvp_at?: string;
  payment_status: PaymentStatus;
  amount_owed: number;
  amount_paid: number;
  payment_intent_id?: string;
  paid_at?: string;
  dietary_restrictions?: string[];
  notes?: string;
  is_organizer: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartyGuestInsert {
  party_id: string;
  name: string;
  email?: string;
  phone?: string;
  user_id?: string;
  rsvp_status?: RSVPStatus;
  payment_status?: PaymentStatus;
  amount_owed?: number;
  dietary_restrictions?: string[];
  notes?: string;
  is_organizer?: boolean;
}

export interface PartyGuestUpdate extends Partial<PartyGuestInsert> {}

// ============================================================================
// AI Planning Sessions
// ============================================================================

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tool_calls?: {
    name: string;
    input: Json;
    result?: Json;
  }[];
}

export interface AIPlanningSession {
  id: string;
  party_id?: string;
  user_id?: string;
  messages: AIMessage[];
  recommendations: AIRecommendations;
  context: Json;
  model_used: string;
  tokens_used: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Vendor Reviews
// ============================================================================

export interface VendorReview {
  id: string;
  vendor_id: string;
  party_id?: string;
  booking_id?: string;
  reviewer_name: string;
  reviewer_email?: string;
  user_id?: string;
  rating: number;
  title?: string;
  review_text?: string;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
}

// ============================================================================
// Partner Analytics
// ============================================================================

export interface PartnerAnalytics {
  id: string;
  vr_partner_id: string;
  period_start: string;
  period_end: string;
  parties_created: number;
  parties_booked: number;
  total_gmv: number;
  total_commission: number;
  unique_visitors: number;
  conversion_rate: number;
  bookings_by_type: Record<VendorType, number>;
  created_at: string;
}

// ============================================================================
// Utility Types
// ============================================================================

// Vendor with packages (for listing)
export interface VendorWithPackages extends ServiceVendor {
  packages: ServicePackage[];
}

// Party with full details (for party hub)
export interface PartyWithDetails extends Party {
  vr_partner?: VRPartner;
  bookings: (PartyBooking & {
    vendor: ServiceVendor;
    package?: ServicePackage;
  })[];
  guests: PartyGuest[];
}

// Booking summary for cart display
export interface BookingSummary {
  vendor_name: string;
  vendor_type: VendorType;
  package_name: string;
  service_date: string;
  guest_price: number;
  retail_value: number;
  savings: number;
  savings_pct: number;
}

// Cart item for multi-vendor cart
export interface PartyCartItem {
  vendor_id: string;
  package_id: string;
  vendor: ServiceVendor;
  package: ServicePackage;
  service_date: string;
  service_time_start?: string;
  service_time_end?: string;
  guest_count: number;
  special_requests?: string;
}
