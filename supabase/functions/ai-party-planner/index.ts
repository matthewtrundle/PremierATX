import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for the AI Party Planner
const PARTY_PLANNER_SYSTEM_PROMPT = `You are an expert AI party planner for Austin bachelor and bachelorette parties. You help organizers plan unforgettable celebrations by recommending curated vendors and experiences.

YOUR ROLE:
- Help users plan bachelor/bachelorette parties in Austin, TX
- Recommend relevant vendors and packages from our curated catalog
- Create personalized itineraries based on party date, guest count, budget, and preferences
- Be enthusiastic, helpful, and knowledgeable about Austin's party scene

CONVERSATION FLOW:
1. Gather key party details: type (bachelor/bachelorette), date, guest count, budget
2. Understand preferences: vibe (wild vs chill), activities, dietary restrictions
3. Recommend vendors and build an itinerary
4. Help refine selections and answer questions

VENDOR CATEGORIES:
- VR Rentals: Luxury vacation homes with pools, patios, hot tubs
- Catering & Private Chefs: BBQ, tacos, upscale dining, brunch
- Entertainment: DJs, live music, performers
- Activities: Bar crawls, boat rentals, spa services, golf, country western bars
- Photography: Event photographers, photo booths
- Transportation: Party buses, limos, shuttles

AUSTIN HIGHLIGHTS:
- 6th Street: Famous bar district for pub crawls
- Lake Travis: Boat parties and waterfront venues
- Rainey Street: Trendy bars in converted bungalows
- South Congress: Hip boutiques and restaurants
- Domain: Upscale shopping and dining

PRICING CONTEXT:
- Budget-friendly: Under $100/person
- Mid-range: $100-250/person
- Premium: $250-500/person
- Luxury: $500+/person

RESPONSE STYLE:
- Be conversational and enthusiastic
- Use emojis sparingly (1-2 per message max)
- Keep responses concise (2-4 paragraphs)
- When recommending vendors, format clearly with name, price, and brief description
- Ask clarifying questions to understand their vision
- Acknowledge what they've told you before asking next question`;

// Types
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PartyContext {
  partyId?: string;
  partyType?: 'bachelor' | 'bachelorette';
  partyDate?: string;
  guestCount?: number;
  budget?: string;
  location?: string;
  preferences?: string[];
}

interface Vendor {
  id: string;
  name: string;
  vendor_type: string;
  description: string;
  packages: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, partyContext, stream = false } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get relevant vendors for context
    const vendorContext = await getVendorContext(supabase, partyContext);

    // Build conversation messages
    const systemMessage = buildSystemMessage(partyContext, vendorContext);

    const apiMessages: Message[] = [
      { role: 'system', content: systemMessage },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Get Vercel AI Gateway API key
    // Vercel AI Gateway uses your Vercel token to proxy requests to various AI providers
    const vercelApiKey = Deno.env.get('VERCEL_AI_GATEWAY_KEY') || Deno.env.get('OPENAI_API_KEY');

    // Mock mode for local development when no API key is configured
    if (!vercelApiKey) {
      console.log('No API key configured - returning mock response for local development');
      const mockResponse = getMockResponse(messages, partyContext);
      return new Response(JSON.stringify({
        message: mockResponse,
        recommendedVendors: [],
        updatedContext: extractPartyContext(messages, partyContext),
        _mock: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vercel AI Gateway base URL
    const AI_GATEWAY_URL = 'https://api.vercel.ai/v1';

    if (stream) {
      // Streaming response via Vercel AI Gateway
      const response = await fetch(`${AI_GATEWAY_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${vercelApiKey}`,
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4-20250514',
          max_tokens: 1024,
          stream: true,
          messages: [
            { role: 'system', content: systemMessage },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content
            }))
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vercel AI Gateway error:', response.status, errorText);
        throw new Error(`Vercel AI Gateway error: ${response.status}`);
      }

      // Return streaming response
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response via Vercel AI Gateway
      const response = await fetch(`${AI_GATEWAY_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${vercelApiKey}`,
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemMessage },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content
            }))
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vercel AI Gateway error:', response.status, errorText);
        throw new Error(`Vercel AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      // Vercel AI Gateway returns OpenAI-compatible format
      const aiResponse = data.choices[0].message.content;

      // Extract any vendor recommendations from the response
      const recommendedVendors = extractVendorRecommendations(aiResponse, vendorContext);

      return new Response(JSON.stringify({
        message: aiResponse,
        recommendedVendors,
        updatedContext: extractPartyContext(messages, partyContext)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('AI Party Planner Error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      message: "I'm having trouble right now. Please try again in a moment!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Build enhanced system message with vendor context
function buildSystemMessage(context: PartyContext, vendors: Vendor[]): string {
  let contextInfo = PARTY_PLANNER_SYSTEM_PROMPT;

  if (context) {
    contextInfo += `\n\nCURRENT PARTY DETAILS:`;
    if (context.partyType) contextInfo += `\n- Type: ${context.partyType === 'bachelor' ? 'Bachelor' : 'Bachelorette'} Party`;
    if (context.partyDate) contextInfo += `\n- Date: ${context.partyDate}`;
    if (context.guestCount) contextInfo += `\n- Guest Count: ${context.guestCount} people`;
    if (context.budget) contextInfo += `\n- Budget: ${context.budget}`;
    if (context.location) contextInfo += `\n- Location: ${context.location}`;
    if (context.preferences?.length) contextInfo += `\n- Preferences: ${context.preferences.join(', ')}`;
  }

  if (vendors.length > 0) {
    contextInfo += `\n\nAVAILABLE VENDORS TO RECOMMEND:`;

    // Group by type
    const vendorsByType: Record<string, Vendor[]> = {};
    vendors.forEach(v => {
      if (!vendorsByType[v.vendor_type]) vendorsByType[v.vendor_type] = [];
      vendorsByType[v.vendor_type].push(v);
    });

    for (const [type, typeVendors] of Object.entries(vendorsByType)) {
      contextInfo += `\n\n${type.toUpperCase()}:`;
      typeVendors.forEach(v => {
        contextInfo += `\n- ${v.name}: ${v.description?.substring(0, 100) || 'Quality service provider'}`;
        if (v.packages?.length > 0) {
          const priceRange = v.packages
            .filter(p => p.guest_price)
            .map(p => p.guest_price);
          if (priceRange.length > 0) {
            const minPrice = Math.min(...priceRange);
            const maxPrice = Math.max(...priceRange);
            contextInfo += ` (from $${minPrice}${maxPrice > minPrice ? ` - $${maxPrice}` : ''})`;
          }
        }
      });
    }

    contextInfo += `\n\nWhen recommending vendors, use the exact names from this list and mention their price ranges.`;
  }

  return contextInfo;
}

// Get relevant vendors from database
async function getVendorContext(supabase: any, context: PartyContext): Promise<Vendor[]> {
  try {
    // Get all active vendors with their packages
    const { data: vendors, error } = await supabase
      .from('service_vendors')
      .select(`
        id,
        name,
        vendor_type,
        description,
        service_packages (
          id,
          name,
          guest_price,
          price_type,
          min_guests,
          max_guests
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    return (vendors || []).map(v => ({
      id: v.id,
      name: v.name,
      vendor_type: v.vendor_type,
      description: v.description,
      packages: v.service_packages || []
    }));
  } catch (error) {
    console.error('getVendorContext error:', error);
    return [];
  }
}

// Extract vendor recommendations from AI response
function extractVendorRecommendations(response: string, vendors: Vendor[]): Vendor[] {
  const recommended: Vendor[] = [];

  vendors.forEach(vendor => {
    if (response.toLowerCase().includes(vendor.name.toLowerCase())) {
      recommended.push(vendor);
    }
  });

  return recommended;
}

// Mock response generator for local development
function getMockResponse(messages: Message[], context: PartyContext): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  // Contextual mock responses based on conversation state
  if (messages.length <= 1) {
    return "Hey there! I'm your AI party planner for Austin bachelor and bachelorette parties. I'm currently in mock mode for local development (no API key configured). What kind of celebration are you planning?";
  }

  if (lastMessage.includes('bachelor') || lastMessage.includes('bachelorette')) {
    return `Awesome! A ${lastMessage.includes('bachelor') ? 'bachelor' : 'bachelorette'} party in Austin sounds amazing! [MOCK MODE] To help you plan the perfect celebration, I'd love to know: How many guests are you expecting, and do you have a date in mind?`;
  }

  if (lastMessage.match(/\d+\s*(people|guests|friends)/)) {
    return "Great! [MOCK MODE] Now let's talk budget. Are you thinking budget-friendly (under $100/person), mid-range ($100-250/person), premium ($250-500/person), or luxury ($500+/person)?";
  }

  if (lastMessage.includes('budget') || lastMessage.includes('$')) {
    return "Perfect! [MOCK MODE] I'd recommend checking out some of our amazing Austin vendors for your celebration. When the AI is fully connected, I'll be able to give you personalized recommendations based on your preferences!";
  }

  return "[MOCK MODE] Thanks for chatting! When the Vercel AI Gateway is configured, I'll be able to provide personalized party planning recommendations. For now, feel free to explore the app!";
}

// Extract and update party context from conversation
function extractPartyContext(messages: Message[], existingContext: PartyContext): PartyContext {
  const context = { ...existingContext };
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  // Extract party type
  if (!context.partyType) {
    if (lastMessage.includes('bachelor')) context.partyType = 'bachelor';
    else if (lastMessage.includes('bachelorette')) context.partyType = 'bachelorette';
  }

  // Extract guest count
  if (!context.guestCount) {
    const guestMatch = lastMessage.match(/(\d+)\s*(people|guests|friends|guys|girls|gals)/);
    if (guestMatch) context.guestCount = parseInt(guestMatch[1]);
  }

  // Extract date
  if (!context.partyDate) {
    // Look for dates in various formats
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
      /(next\s+)?(saturday|sunday|friday|weekend)/i
    ];

    for (const pattern of datePatterns) {
      const match = lastMessage.match(pattern);
      if (match) {
        context.partyDate = match[0];
        break;
      }
    }
  }

  // Extract budget
  if (!context.budget) {
    const budgetPatterns = [
      { pattern: /\$(\d+,?\d*)\s*(per|each|\/)/i, format: (m: string[]) => `$${m[1]}/person` },
      { pattern: /budget.*\$(\d+,?\d*)/i, format: (m: string[]) => `$${m[1]} total` },
      { pattern: /(luxury|premium|high.end)/i, format: () => 'premium' },
      { pattern: /(budget|affordable|cheap)/i, format: () => 'budget-friendly' },
      { pattern: /(mid.?range|moderate)/i, format: () => 'mid-range' }
    ];

    for (const { pattern, format } of budgetPatterns) {
      const match = lastMessage.match(pattern);
      if (match) {
        context.budget = format(match);
        break;
      }
    }
  }

  return context;
}
