-- Austin Vendor Seed Data
-- Creates a diverse set of vendors for the party planning platform

-- ============================================================================
-- CATERING VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  'Austin BBQ Catering Co.',
  'austin-bbq-catering',
  'catering',
  'Authentic Texas BBQ catering for groups of all sizes. Slow-smoked brisket, ribs, and all the fixings. Perfect for bachelor parties looking for that true Austin experience.',
  ARRAY['austin', 'round-rock', 'cedar-park'],
  'events@austinbbqcatering.com',
  '512-555-1001',
  'https://austinbbqcatering.com',
  '2100 Congress Ave, Austin, TX 78701',
  'wholesale',
  18,
  10,
  4.8,
  124,
  true,
  true
),
(
  'Taco Royale',
  'taco-royale',
  'catering',
  'Premium taco catering with a mobile taco bar experience. Fresh ingredients, house-made salsas, and endless customization options.',
  ARRAY['austin', 'round-rock', 'pflugerville'],
  'catering@tacoroyale.com',
  '512-555-1002',
  'https://tacoroyale.com',
  '1800 S Lamar Blvd, Austin, TX 78704',
  'wholesale',
  15,
  8,
  4.9,
  98,
  true,
  true
),
(
  'Private Chef ATX',
  'private-chef-atx',
  'catering',
  'Upscale private chef experience in your rental property. Custom menus, wine pairings, and full-service catering for intimate gatherings.',
  ARRAY['austin', 'lakeway', 'westlake'],
  'book@privatechefatx.com',
  '512-555-1003',
  'https://privatechefatx.com',
  'Mobile Service',
  'wholesale',
  20,
  6,
  5.0,
  45,
  true,
  true
);

-- ============================================================================
-- DJ & ENTERTAINMENT VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  'Austin Party DJs',
  'austin-party-djs',
  'dj',
  'Professional DJs specializing in bachelor and bachelorette parties. Top-of-the-line sound systems, lighting, and MC services.',
  ARRAY['austin', 'round-rock', 'cedar-park', 'lakeway'],
  'book@austinpartydjs.com',
  '512-555-2001',
  'https://austinpartydjs.com',
  '3500 S Congress Ave, Austin, TX 78704',
  'wholesale',
  15,
  8,
  4.7,
  156,
  true,
  true
),
(
  'Silent Disco ATX',
  'silent-disco-atx',
  'entertainment',
  'Unique silent disco experience with wireless headphones. Multiple channels, custom playlists, and perfect for noise-sensitive venues.',
  ARRAY['austin'],
  'events@silentdiscoatx.com',
  '512-555-2002',
  'https://silentdiscoatx.com',
  '700 E 6th St, Austin, TX 78701',
  'wholesale',
  12,
  15,
  4.8,
  67,
  false,
  true
),
(
  'Live Music Austin',
  'live-music-austin',
  'entertainment',
  'Book live musicians for your party - from acoustic duos to full bands. Austin music scene veterans who know how to get the party started.',
  ARRAY['austin', 'round-rock', 'lakeway'],
  'booking@livemusicaustin.com',
  '512-555-2003',
  'https://livemusicaustin.com',
  '115 San Jacinto Blvd, Austin, TX 78701',
  'wholesale',
  10,
  10,
  4.9,
  82,
  true,
  true
);

-- ============================================================================
-- PHOTOGRAPHY & VIDEOGRAPHY VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  'Party Pics ATX',
  'party-pics-atx',
  'photography',
  'Event photography specialists. Candid shots, group photos, and same-day digital delivery. Perfect for capturing your bach party memories.',
  ARRAY['austin', 'round-rock', 'cedar-park', 'lakeway', 'dripping-springs'],
  'book@partypicsatx.com',
  '512-555-3001',
  'https://partypicsatx.com',
  '1100 S 1st St, Austin, TX 78704',
  'wholesale',
  15,
  8,
  4.8,
  203,
  true,
  true
),
(
  'Austin Photo Booth Co.',
  'austin-photo-booth',
  'photography',
  'Premium photo booth rental with props, custom backdrops, and instant prints. Digital sharing and GIF booth options available.',
  ARRAY['austin', 'round-rock'],
  'rentals@atxphotobooth.com',
  '512-555-3002',
  'https://atxphotobooth.com',
  '2200 S Lamar Blvd, Austin, TX 78704',
  'wholesale',
  18,
  15,
  4.7,
  145,
  false,
  true
);

-- ============================================================================
-- TRANSPORTATION VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  'Austin Party Bus',
  'austin-party-bus',
  'transportation',
  'Luxury party buses for 20-50 guests. LED lighting, premium sound systems, and wet bars. The ultimate way to travel to your party destinations.',
  ARRAY['austin', 'round-rock', 'cedar-park', 'lakeway', 'san-antonio'],
  'reservations@austinpartybus.com',
  '512-555-4001',
  'https://austinpartybus.com',
  '4500 E 5th St, Austin, TX 78702',
  'wholesale',
  12,
  15,
  4.9,
  178,
  true,
  true
),
(
  'VIP Limo Austin',
  'vip-limo-austin',
  'transportation',
  'Stretch limos, Sprinter vans, and luxury SUVs. Professional chauffeurs, champagne service, and red carpet treatment.',
  ARRAY['austin', 'round-rock', 'lakeway', 'dripping-springs'],
  'book@viplimoaustin.com',
  '512-555-4002',
  'https://viplimoaustin.com',
  '2500 E Cesar Chavez, Austin, TX 78702',
  'wholesale',
  15,
  6,
  4.8,
  134,
  true,
  true
),
(
  'Pedal Party Austin',
  'pedal-party-austin',
  'transportation',
  'Group pedal pub bikes for bar crawls and brewery tours. BYOB allowed, Bluetooth speakers, and experienced guides.',
  ARRAY['austin'],
  'ride@pedalpartyatx.com',
  '512-555-4003',
  'https://pedalpartyatx.com',
  '400 E 6th St, Austin, TX 78701',
  'wholesale',
  10,
  8,
  4.7,
  98,
  false,
  true
);

-- ============================================================================
-- ACTIVITIES & EXPERIENCES VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  'Lake Travis Party Boats',
  'lake-travis-party-boats',
  'activities',
  'Pontoon boats, party barges, and yacht charters on Lake Travis. BYOB cruises, sunset tours, and all-day party packages.',
  ARRAY['austin', 'lakeway'],
  'charter@laketravisparty.com',
  '512-555-5001',
  'https://laketravispartyboats.com',
  '1612 S Lakeway Dr, Lakeway, TX 78734',
  'wholesale',
  18,
  8,
  4.9,
  234,
  true,
  true
),
(
  'ATX Escape Games',
  'atx-escape-games',
  'activities',
  'Private escape room experiences for groups. Multiple themed rooms, competitive team challenges, and exclusive after-hours bookings.',
  ARRAY['austin'],
  'book@atxescapegames.com',
  '512-555-5002',
  'https://atxescapegames.com',
  '501 N IH-35, Austin, TX 78702',
  'affiliate',
  NULL,
  4,
  4.8,
  312,
  false,
  true
),
(
  'Axe Throwing Austin',
  'axe-throwing-austin',
  'activities',
  'Private lane rentals for axe throwing parties. Expert coaches, tournament options, and BYOB friendly.',
  ARRAY['austin', 'round-rock'],
  'events@axethrowingaustin.com',
  '512-555-5003',
  'https://axethrowingaustin.com',
  '1209 E 6th St, Austin, TX 78702',
  'wholesale',
  15,
  6,
  4.7,
  189,
  true,
  true
),
(
  'Wine Tour Austin',
  'wine-tour-austin',
  'activities',
  'Guided wine tours through Texas Hill Country. Visit 3-4 wineries, enjoy tastings, and travel in luxury transportation.',
  ARRAY['austin', 'dripping-springs', 'fredericksburg'],
  'tours@winetouraustin.com',
  '512-555-5004',
  'https://winetouraustin.com',
  'Pickup from your location',
  'wholesale',
  20,
  6,
  4.9,
  156,
  true,
  true
),
(
  'Golf ATX',
  'golf-atx',
  'activities',
  'Group golf packages at premier Austin courses. Club rentals, lessons, and tournament-style outings available.',
  ARRAY['austin', 'lakeway', 'round-rock'],
  'teetimes@golfatx.com',
  '512-555-5005',
  'https://golfatx.com',
  'Various locations',
  'affiliate',
  NULL,
  4,
  4.6,
  87,
  false,
  true
);

-- ============================================================================
-- SPA & WELLNESS VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  'Mobile Spa Austin',
  'mobile-spa-austin',
  'spa',
  'In-home spa services for your bach party. Massages, facials, mani/pedis, and customizable spa packages delivered to your door.',
  ARRAY['austin', 'round-rock', 'cedar-park', 'lakeway'],
  'book@mobilespaaustin.com',
  '512-555-6001',
  'https://mobilespaaustin.com',
  'Mobile Service',
  'wholesale',
  15,
  4,
  4.9,
  178,
  true,
  true
),
(
  'Yoga & Mimosas ATX',
  'yoga-mimosas-atx',
  'spa',
  'Private yoga sessions paired with mimosa bars. Perfect for a relaxing bachelorette morning before the party begins.',
  ARRAY['austin'],
  'namaste@yogamimosasatx.com',
  '512-555-6002',
  'https://yogamimosasatx.com',
  'Studio or Mobile',
  'wholesale',
  12,
  6,
  4.8,
  92,
  false,
  true
);

-- ============================================================================
-- DECOR & PARTY SUPPLIES VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  'Bach Party Decor ATX',
  'bach-party-decor',
  'decor',
  'Complete party decoration packages for bachelor and bachelorette parties. Balloon installations, banners, sashes, and custom touches.',
  ARRAY['austin', 'round-rock', 'cedar-park'],
  'decorate@bachpartydecor.com',
  '512-555-7001',
  'https://bachpartydecor.com',
  '3400 Guadalupe St, Austin, TX 78705',
  'wholesale',
  20,
  1,
  4.8,
  145,
  true,
  true
),
(
  'Neon Sign Rentals ATX',
  'neon-sign-rentals',
  'decor',
  'Custom neon sign rentals for parties. "Bride to Be", "Same Penis Forever", and custom messages available.',
  ARRAY['austin'],
  'glow@neonsignrentals.com',
  '512-555-7002',
  'https://neonsignrentalsatx.com',
  '1500 S Congress Ave, Austin, TX 78704',
  'wholesale',
  15,
  1,
  4.7,
  67,
  false,
  true
);

-- ============================================================================
-- TOURS VENDORS
-- ============================================================================
INSERT INTO public.service_vendors (
  name, slug, vendor_type, description, service_area,
  contact_email, contact_phone, website_url, business_address,
  pricing_model, wholesale_discount_pct, min_group_size,
  rating, review_count, is_featured, is_active
) VALUES
(
  '6th Street Bar Crawl',
  '6th-street-bar-crawl',
  'tours',
  'Guided bar crawl experiences on 6th Street. Skip the lines, free shots, and exclusive VIP access at partner venues.',
  ARRAY['austin'],
  'crawl@6thstreetbarcrawl.com',
  '512-555-8001',
  'https://6thstreetbarcrawl.com',
  'Meeting point: 6th & Brazos',
  'wholesale',
  15,
  8,
  4.7,
  234,
  true,
  true
),
(
  'Haunted Austin Tours',
  'haunted-austin-tours',
  'tours',
  'Spooky guided tours through Austin''s haunted history. Perfect for unique bach party entertainment.',
  ARRAY['austin'],
  'boo@hauntedaustintours.com',
  '512-555-8002',
  'https://hauntedaustintours.com',
  'Capitol grounds',
  'affiliate',
  NULL,
  6,
  4.6,
  156,
  false,
  true
);

-- Update affiliate_commission_pct for affiliate vendors
UPDATE public.service_vendors
SET affiliate_commission_pct = 12
WHERE pricing_model = 'affiliate';

-- ============================================================================
-- SERVICE PACKAGES FOR KEY VENDORS
-- ============================================================================

-- Austin BBQ Catering packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  'Basic BBQ Package',
  'Brisket, sausage, sides, and drinks for your crew',
  35.00, 28.00, 32.00, 'per_person',
  10, 50, 3,
  ARRAY['Slow-smoked brisket', 'Homemade sausage', '3 sides', 'Sweet tea & lemonade', 'Plates & utensils'],
  '72 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = 'austin-bbq-catering'
UNION ALL
SELECT
  id,
  'Premium BBQ Package',
  'Full spread with ribs, brisket, turkey, and premium sides',
  55.00, 44.00, 50.00, 'per_person',
  10, 100, 4,
  ARRAY['Brisket', 'Ribs', 'Smoked turkey', '5 premium sides', 'Dessert', 'All beverages', 'Servers included'],
  '72 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = 'austin-bbq-catering';

-- Lake Travis Party Boats packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  '3-Hour Party Cruise',
  'Perfect afternoon on Lake Travis with your party crew',
  800.00, 640.00, 720.00, 'fixed',
  8, 12, 3,
  ARRAY['Captain included', 'Bluetooth speakers', 'Cooler with ice', 'BYOB allowed', 'Swimming stops'],
  '48 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = 'lake-travis-party-boats'
UNION ALL
SELECT
  id,
  'Sunset Cruise',
  'Stunning sunset views on Lake Travis',
  600.00, 480.00, 540.00, 'fixed',
  8, 12, 2,
  ARRAY['Captain included', 'Bluetooth speakers', 'Cooler with ice', 'BYOB allowed', 'Best sunset spots'],
  '48 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = 'lake-travis-party-boats'
UNION ALL
SELECT
  id,
  'All-Day Party Barge',
  'Full-day party experience with large party barge',
  2400.00, 1920.00, 2160.00, 'fixed',
  15, 25, 8,
  ARRAY['Captain included', 'Full sound system', '2 coolers with ice', 'BYOB allowed', 'Multiple swimming stops', 'Grilling on boat'],
  '7 days notice for full refund',
  3
FROM public.service_vendors WHERE slug = 'lake-travis-party-boats';

-- Austin Party DJs packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  '4-Hour DJ Package',
  'Professional DJ setup for your party',
  600.00, 510.00, 550.00, 'fixed',
  10, NULL, 4,
  ARRAY['Professional DJ', 'Premium sound system', 'Basic lighting', 'Custom playlist consultation', 'Wireless microphone'],
  '48 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = 'austin-party-djs'
UNION ALL
SELECT
  id,
  'Ultimate Party Package',
  'Full production with DJ, lighting, and effects',
  1200.00, 1020.00, 1100.00, 'fixed',
  15, NULL, 6,
  ARRAY['Professional DJ', 'Premium sound system', 'Full LED lighting', 'Fog machine', 'Laser effects', 'MC services', '2 wireless mics'],
  '72 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = 'austin-party-djs';

-- Mobile Spa Austin packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  'Mani-Pedi Party',
  'Relaxing manicures and pedicures for the whole group',
  75.00, 60.00, 68.00, 'per_person',
  4, 12, 2,
  ARRAY['Luxury manicure', 'Spa pedicure', 'Choice of polish', 'Champagne service', 'Nail art options'],
  '24 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = 'mobile-spa-austin'
UNION ALL
SELECT
  id,
  'Pamper Package',
  'Full spa experience with massage, facial, and nails',
  175.00, 140.00, 158.00, 'per_person',
  4, 10, 4,
  ARRAY['60-min massage', 'Express facial', 'Manicure', 'Pedicure', 'Mimosas included'],
  '48 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = 'mobile-spa-austin';

-- VIP Limo Austin packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  'Night Out Package',
  '4-hour limo service for your night on the town',
  500.00, 425.00, 460.00, 'fixed',
  6, 10, 4,
  ARRAY['Stretch limo', 'Professional chauffeur', 'Complimentary champagne', 'Red carpet service', 'Unlimited stops'],
  '48 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = 'vip-limo-austin'
UNION ALL
SELECT
  id,
  'Sprinter VIP',
  'Luxury Sprinter van for larger groups',
  700.00, 595.00, 640.00, 'fixed',
  8, 14, 4,
  ARRAY['Mercedes Sprinter', 'LED lighting', 'Premium sound', 'Complimentary champagne', 'Cooler with ice'],
  '48 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = 'vip-limo-austin';

-- Bach Party Decor packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  'Essential Decor Kit',
  'Everything you need to deck out your rental',
  150.00, 120.00, 135.00, 'fixed',
  1, NULL, NULL,
  ARRAY['Balloon garland', 'Bride-to-be sash', 'Party banner', 'Rose gold accessories', 'Table confetti'],
  '48 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = 'bach-party-decor'
UNION ALL
SELECT
  id,
  'Premium Decor Package',
  'Full setup and takedown included',
  400.00, 320.00, 360.00, 'fixed',
  1, NULL, NULL,
  ARRAY['Professional installation', 'Large balloon arch', 'Neon sign rental', 'Table settings', 'Photo backdrop', 'Cleanup included'],
  '72 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = 'bach-party-decor';

-- Wine Tour Austin packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  'Classic Wine Tour',
  'Visit 3 Hill Country wineries with tastings included',
  125.00, 100.00, 112.00, 'per_person',
  6, 12, 5,
  ARRAY['Luxury transportation', '3 winery visits', 'Tastings included', 'Knowledgeable guide', 'Picnic lunch'],
  '48 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = 'wine-tour-austin'
UNION ALL
SELECT
  id,
  'VIP Wine Experience',
  'Private tours, premium tastings, and gourmet lunch',
  195.00, 156.00, 175.00, 'per_person',
  6, 12, 7,
  ARRAY['Private tours at each winery', 'Reserve tastings', 'Gourmet lunch', 'Take-home wine', 'Photo opportunities'],
  '72 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = 'wine-tour-austin';

-- 6th Street Bar Crawl packages
INSERT INTO public.service_packages (
  vendor_id, name, description,
  retail_price, net_price, guest_price, price_type,
  min_guests, max_guests, duration_hours,
  features, cancellation_policy, display_order
)
SELECT
  id,
  'Classic Bar Crawl',
  '4 bars, 4 hours, tons of fun',
  45.00, 36.00, 40.00, 'per_person',
  8, 25, 4,
  ARRAY['Skip-the-line entry', 'Shot at each bar', 'Dedicated host', 'Party props', 'Photo memories'],
  '24 hours notice for full refund',
  1
FROM public.service_vendors WHERE slug = '6th-street-bar-crawl'
UNION ALL
SELECT
  id,
  'VIP Bar Crawl',
  'Premium venues with VIP treatment',
  75.00, 60.00, 68.00, 'per_person',
  8, 20, 5,
  ARRAY['VIP entry everywhere', 'Bottle service at final venue', 'Dedicated host', 'Bachelor/bachelorette sashes', 'Pro photographer'],
  '48 hours notice for full refund',
  2
FROM public.service_vendors WHERE slug = '6th-street-bar-crawl';
