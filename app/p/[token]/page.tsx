'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  CalendarDays,
  Users,
  MapPin,
  Sparkles,
  Send,
  Loader2,
  PartyPopper,
  User,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Ship,
  Car,
  Utensils,
  Music,
  Camera,
  Plane,
  Menu,
  Globe,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePartyByShareToken, PartyWithPartnerBranding } from '@/hooks/useParties';
import { useAIPlanner, Message } from '@/hooks/useAIPlanner';

// Import images
import heroImage from '@/assets/hero/party-hero.jpg';
import boatImage from '@/assets/boats/day-tripper-1.jpg';
import mansionImage from '@/assets/rentals/mansion-1.jpg';
import vehicleImage from '@/assets/vehicles/16-pax-limo-bus.jpg';
import partyImage1 from '@/assets/party-square-1.jpg';
import partyImage2 from '@/assets/party-square-2.jpg';
import partyImage3 from '@/assets/party-square-3.jpg';
import partyImage4 from '@/assets/party-square-4.jpg';
import partyImage5 from '@/assets/party-square-5.jpg';

// Category icons
const categories = [
  { id: 'boats', label: 'Lake & Boats', icon: Ship },
  { id: 'transport', label: 'Transportation', icon: Car },
  { id: 'food', label: 'Food & Chefs', icon: Utensils },
  { id: 'entertainment', label: 'Entertainment', icon: Music },
  { id: 'photos', label: 'Photography', icon: Camera },
  { id: 'experiences', label: 'Experiences', icon: Plane },
];

// Sample vendors data
const sampleVendors = [
  { id: '1', name: 'Lake Travis Boat Party', category: 'Lake & Boats', price: 150, rating: 4.95, reviews: 127, image: boatImage, badge: 'Guest favorite' },
  { id: '2', name: 'Luxury Party Bus', category: 'Transportation', price: 85, rating: 4.88, reviews: 89, image: vehicleImage, badge: 'Guest favorite' },
  { id: '3', name: 'Private Chef Experience', category: 'Food & Chefs', price: 75, rating: 4.92, reviews: 156, image: partyImage1 },
  { id: '4', name: 'Poolside DJ Package', category: 'Entertainment', price: 200, rating: 4.78, reviews: 64, image: partyImage2 },
  { id: '5', name: 'Photo Booth Rental', category: 'Photography', price: 250, rating: 4.96, reviews: 203, image: partyImage3, badge: 'Guest favorite' },
  { id: '6', name: 'Wine Tour Experience', category: 'Experiences', price: 95, rating: 4.85, reviews: 98, image: partyImage4 },
  { id: '7', name: 'Lakehouse Mansion', category: 'Venues', price: 450, rating: 4.99, reviews: 312, image: mansionImage, badge: 'Superhost' },
  { id: '8', name: 'Sunset Cocktail Cruise', category: 'Lake & Boats', price: 120, rating: 4.91, reviews: 87, image: partyImage5 },
];

// Format date
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Vendor Card Component (Airbnb-style)
function VendorCard({
  vendor,
  onFavorite,
}: {
  vendor: typeof sampleVendors[0];
  onFavorite?: (id: string) => void;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={vendor.image}
          alt={vendor.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
            onFavorite?.(vendor.id);
          }}
          className="absolute top-3 right-3 z-10 p-1.5"
        >
          <Heart
            className={cn(
              'w-6 h-6 transition-colors drop-shadow-md',
              isFavorite ? 'fill-red-500 text-red-500' : 'fill-black/30 text-white'
            )}
            strokeWidth={1.5}
          />
        </button>

        {/* Badge */}
        {vendor.badge && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-white rounded-full text-xs font-semibold text-gray-900 shadow-sm">
            {vendor.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-medium text-[15px] text-gray-900 line-clamp-1">{vendor.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-current text-gray-900" />
            <span className="text-sm text-gray-900">{vendor.rating}</span>
          </div>
        </div>
        <p className="text-[15px] text-gray-500 mt-0.5">{vendor.category}</p>
        <p className="mt-1">
          <span className="font-semibold text-[15px] text-gray-900">${vendor.price}</span>
          <span className="text-[15px] text-gray-500"> per person</span>
        </p>
      </div>
    </div>
  );
}

// Section with horizontal scroll
function Section({
  title,
  children,
  viewAllHref,
}: {
  title: string;
  children: React.ReactNode;
  viewAllHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -400 : 400,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5 px-6 lg:px-10">
        <h2 className="text-[22px] font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link href={viewAllHref} className="text-sm font-semibold underline mr-3 hidden sm:block">
              Show all
            </Link>
          )}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-all',
              canScrollLeft ? 'hover:border-gray-400 hover:shadow-sm' : 'opacity-40 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-all',
              canScrollRight ? 'hover:border-gray-400 hover:shadow-sm' : 'opacity-40 cursor-not-allowed'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-6 lg:px-10 pb-2"
      >
        {children}
      </div>
    </section>
  );
}

// AI Chat Panel
function ChatPanel({
  messages,
  isLoading,
  onSend,
  onClose,
}: {
  messages: Message[];
  isLoading: boolean;
  onSend: (msg: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl h-[85vh] sm:h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Party Planner AI</h3>
              <p className="text-xs text-gray-500">Ask me anything</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                msg.role === 'user' ? 'bg-gray-200' : 'bg-gradient-to-br from-pink-500 to-rose-500'
              )}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-gray-600" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={cn(
                'max-w-[80%] px-4 py-2.5 rounded-2xl text-[15px]',
                msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about activities, food, transportation..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-[15px] focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white transition-all',
                input.trim() && !isLoading ? 'hover:shadow-lg hover:scale-105' : 'opacity-50'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function PartySharePage() {
  const params = useParams();
  const token = params?.token as string;
  const { data: partyData, isLoading: partyLoading, error: partyError } = usePartyByShareToken(token);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const party = partyData?.party;
  const partner = partyData?.partner;

  const { messages, isLoading: aiLoading, sendMessage } = useAIPlanner({
    initialContext: party ? {
      partyId: party.id,
      partyType: party.party_type as 'bachelor' | 'bachelorette',
      partyDate: party.party_date,
      guestCount: party.guest_count,
    } : undefined,
  });

  // Loading state
  if (partyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (partyError || !party) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-md">
          <PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Party not found</h1>
          <p className="text-gray-500 mb-6">This link may have expired or doesn't exist.</p>
          <Link href="/" className="inline-flex px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const partyName = party.party_name || `${party.honoree_name}'s ${party.party_type === 'bachelor' ? 'Bachelor' : 'Bachelorette'}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-20 px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {partner?.logo_url ? (
              <img src={partner.logo_url} alt={partner.name || ''} className="h-8" />
            ) : (
              <span className="text-xl font-bold text-rose-500">PremierATX</span>
            )}
          </Link>

          {/* Search Bar (Airbnb-style) */}
          <div className="hidden md:flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <button className="px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-200">
              {partyName}
            </button>
            <button className="px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-200">
              {formatDate(party.party_date)}
            </button>
            <button className="px-4 py-2.5 text-sm text-gray-500">
              {party.guest_count} guests
            </button>
            <button className="m-1.5 p-2 bg-rose-500 rounded-full">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChat(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              AI Planner
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 p-1.5 pl-3 border border-gray-300 rounded-full hover:shadow-md transition-shadow">
              <Menu className="w-4 h-4" />
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden px-4 pb-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-full shadow-sm">
            <Search className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{partyName}</p>
              <p className="text-xs text-gray-500">{formatDate(party.party_date)} · {party.guest_count} guests</p>
            </div>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-8 px-6 lg:px-10 overflow-x-auto scrollbar-hide border-t border-gray-100 py-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                className={cn(
                  'flex flex-col items-center gap-2 pb-2 border-b-2 transition-all flex-shrink-0',
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Banner */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden mx-6 lg:mx-10 mt-6 rounded-2xl">
          <Image
            src={heroImage}
            alt="Party celebration"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-sm font-medium mb-4 w-fit">
              <PartyPopper className="w-4 h-4" />
              <span className="capitalize">{party.party_type} Party</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">{partyName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {formatDate(party.party_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {party.guest_count} guests
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {party.location || 'Austin, TX'}
              </span>
            </div>
          </div>
        </div>

        {/* Popular Activities */}
        <Section title="Popular in Austin" viewAllHref="#">
          {sampleVendors.filter(v => v.badge).map((vendor) => (
            <div key={vendor.id} className="flex-shrink-0 w-[280px]">
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </Section>

        {/* Lake & Boats */}
        <Section title="Lake & Boats" viewAllHref="#">
          {sampleVendors.filter(v => v.category === 'Lake & Boats').concat(sampleVendors.slice(0, 4)).map((vendor, i) => (
            <div key={`${vendor.id}-${i}`} className="flex-shrink-0 w-[280px]">
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </Section>

        {/* Transportation */}
        <Section title="Transportation" viewAllHref="#">
          {sampleVendors.filter(v => v.category === 'Transportation').concat(sampleVendors.slice(2, 6)).map((vendor, i) => (
            <div key={`${vendor.id}-${i}`} className="flex-shrink-0 w-[280px]">
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </Section>

        {/* All Experiences */}
        <section className="py-8 px-6 lg:px-10">
          <h2 className="text-[22px] font-semibold text-gray-900 mb-5">All experiences</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sampleVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>
      </main>

      {/* Floating AI Button (Mobile) */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full shadow-lg flex items-center justify-center text-white z-30"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      {showChat && (
        <ChatPanel
          messages={messages}
          isLoading={aiLoading}
          onSend={sendMessage}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
