/**
 * Seed Demo Data Script
 *
 * Creates demo auth user and demo party for testing the full flow.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (NOT the anon key!)
 */

import { createClient } from '@supabase/supabase-js';

// Demo credentials
const DEMO_EMAIL = 'demo@luxurylakeretreats.com';
const DEMO_PASSWORD = 'demo123!';
const DEMO_PARTNER_SLUG = 'demo-luxury';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nRun with:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/seed-demo.ts');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedDemoUser() {
  console.log('🔐 Creating demo auth user...');

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

  if (existingUser) {
    console.log('   ✓ Demo user already exists, updating password...');

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: DEMO_PASSWORD }
    );

    if (updateError) {
      console.error('   ❌ Failed to update user:', updateError.message);
      return null;
    }

    // Link to partner record
    await supabase
      .from('vr_partners')
      .update({ auth_user_id: existingUser.id })
      .eq('email', DEMO_EMAIL);

    return existingUser;
  }

  // Create new user
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      role: 'partner',
      partner_name: 'Luxury Lake Retreats',
    },
  });

  if (createError) {
    console.error('   ❌ Failed to create user:', createError.message);
    return null;
  }

  console.log('   ✓ Demo user created successfully!');

  // Link to partner record
  const { error: linkError } = await supabase
    .from('vr_partners')
    .update({ auth_user_id: newUser.user.id })
    .eq('email', DEMO_EMAIL);

  if (linkError) {
    console.error('   ⚠ Warning: Failed to link user to partner:', linkError.message);
  }

  return newUser.user;
}

async function seedDemoParty(partnerId: string) {
  console.log('🎉 Creating demo party...');

  // Check if demo party already exists
  const { data: existingParty } = await supabase
    .from('parties')
    .select('id, share_token')
    .eq('vr_partner_id', partnerId)
    .eq('party_name', "Sarah's Bachelorette Weekend")
    .single();

  if (existingParty) {
    console.log('   ✓ Demo party already exists');
    return existingParty;
  }

  // Get partner ID
  const { data: partner } = await supabase
    .from('vr_partners')
    .select('id')
    .eq('email', DEMO_EMAIL)
    .single();

  if (!partner) {
    console.error('   ❌ Demo partner not found in database');
    return null;
  }

  // Create demo party
  const partyDate = new Date();
  partyDate.setDate(partyDate.getDate() + 30); // 30 days from now

  const partyEndDate = new Date(partyDate);
  partyEndDate.setDate(partyEndDate.getDate() + 2); // 3-day weekend

  const { data: party, error: partyError } = await supabase
    .from('parties')
    .insert({
      vr_partner_id: partner.id,
      organizer_email: 'sarah.bride@example.com',
      organizer_name: 'Sarah Miller',
      organizer_phone: '512-555-1234',
      party_type: 'bachelorette',
      party_name: "Sarah's Bachelorette Weekend",
      honoree_name: 'Sarah',
      party_date: partyDate.toISOString().split('T')[0],
      party_end_date: partyEndDate.toISOString().split('T')[0],
      guest_count: 12,
      budget_range: 'premium',
      location: 'Austin, TX',
      venue_address: '1234 Lake Travis Blvd, Austin, TX 78734',
      preferences: {
        vibe: ['fun', 'classy', 'memorable'],
        activities: ['lake', 'spa', 'nightlife'],
        dietary_restrictions: ['vegetarian-options'],
        must_haves: ['boat-day', 'nice-dinner'],
        avoid: ['extreme-sports'],
      },
      special_requests: 'Surprise the bride with a cake on Saturday night!',
      status: 'planning',
      created_by_partner: true,
      partner_notes: 'VIP guests, staying at our lakefront property. Make it special!',
    })
    .select()
    .single();

  if (partyError) {
    console.error('   ❌ Failed to create party:', partyError.message);
    return null;
  }

  console.log('   ✓ Demo party created successfully!');
  console.log(`   📎 Share token: ${party.share_token}`);

  return party;
}

async function seedDemoGuests(partyId: string) {
  console.log('👥 Creating demo guests...');

  const guests = [
    { name: 'Sarah Miller', email: 'sarah.bride@example.com', is_organizer: true, rsvp_status: 'confirmed' },
    { name: 'Emily Johnson', email: 'emily.j@example.com', rsvp_status: 'confirmed' },
    { name: 'Jessica Williams', email: 'jess.w@example.com', rsvp_status: 'confirmed' },
    { name: 'Ashley Brown', email: 'ashley.b@example.com', rsvp_status: 'confirmed' },
    { name: 'Amanda Davis', email: 'amanda.d@example.com', rsvp_status: 'maybe' },
    { name: 'Brittany Wilson', email: 'brittany.w@example.com', rsvp_status: 'pending' },
    { name: 'Stephanie Moore', email: 'steph.m@example.com', rsvp_status: 'confirmed' },
    { name: 'Nicole Taylor', email: 'nicole.t@example.com', rsvp_status: 'confirmed' },
    { name: 'Rachel Anderson', email: 'rachel.a@example.com', rsvp_status: 'confirmed' },
    { name: 'Megan Thomas', email: 'megan.t@example.com', rsvp_status: 'declined' },
    { name: 'Lauren Jackson', email: 'lauren.j@example.com', rsvp_status: 'pending' },
    { name: 'Christina White', email: 'christina.w@example.com', rsvp_status: 'confirmed' },
  ];

  // Check if guests already exist
  const { data: existingGuests } = await supabase
    .from('party_guests')
    .select('id')
    .eq('party_id', partyId);

  if (existingGuests && existingGuests.length > 0) {
    console.log('   ✓ Demo guests already exist');
    return existingGuests;
  }

  const guestsToInsert = guests.map((g, index) => ({
    party_id: partyId,
    name: g.name,
    email: g.email,
    is_organizer: g.is_organizer || false,
    rsvp_status: g.rsvp_status,
    amount_owed: 150, // $150 per person estimate
    amount_paid: g.rsvp_status === 'confirmed' ? 150 : 0,
    payment_status: g.rsvp_status === 'confirmed' ? 'paid' : 'unpaid',
  }));

  const { data: insertedGuests, error: guestsError } = await supabase
    .from('party_guests')
    .insert(guestsToInsert)
    .select();

  if (guestsError) {
    console.error('   ❌ Failed to create guests:', guestsError.message);
    return null;
  }

  console.log(`   ✓ Created ${insertedGuests.length} demo guests`);
  return insertedGuests;
}

async function main() {
  console.log('\n🚀 PremierATX Demo Data Seeder\n');
  console.log('═'.repeat(50));

  // Step 1: Create/update demo auth user
  const user = await seedDemoUser();
  if (!user) {
    console.error('\n❌ Failed to seed demo user. Exiting.');
    process.exit(1);
  }

  // Step 2: Get partner record
  const { data: partner } = await supabase
    .from('vr_partners')
    .select('id, name')
    .eq('email', DEMO_EMAIL)
    .single();

  if (!partner) {
    console.error('\n❌ Demo partner not found. Make sure migrations have run.');
    process.exit(1);
  }

  console.log(`\n📦 Partner: ${partner.name}`);

  // Step 3: Create demo party
  const party = await seedDemoParty(partner.id);
  if (!party) {
    console.error('\n❌ Failed to seed demo party. Exiting.');
    process.exit(1);
  }

  // Step 4: Create demo guests
  await seedDemoGuests(party.id);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Demo data seeded successfully!\n');
  console.log('📋 Demo Credentials:');
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log('\n🔗 Demo URLs:');
  console.log(`   Partner Login: /partner-portal/login`);
  console.log(`   Guest Page:    /p/${party.share_token}`);
  console.log('\n');
}

main().catch(console.error);
