'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  CalendarDays,
  Users,
  DollarSign,
  Plus,
  ChevronRight,
  PartyPopper,
  Copy,
  Check,
  LogOut,
  Loader2,
  ExternalLink,
  Sparkles,
  Heart,
  Star,
  TrendingUp,
  Menu,
  Search,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePartnerSession, usePartnerLogout } from '@/hooks/usePartnerAuth';
import { usePartiesByPartner, usePartyStats, getPartyShareUrl } from '@/hooks/useParties';
import { Party, PartyStatus } from '@/types/partyPlanning';

// Party type icons and colors
const partyTypeConfig: Record<string, { emoji: string; gradient: string; image: string }> = {
  bachelor: {
    emoji: '🎉',
    gradient: 'from-blue-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop'
  },
  bachelorette: {
    emoji: '💕',
    gradient: 'from-pink-500 to-rose-600',
    image: 'https://images.unsplash.com/photo-1496843916299-590492c751f4?w=400&h=400&fit=crop'
  },
  birthday: {
    emoji: '🎂',
    gradient: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop'
  },
  corporate: {
    emoji: '💼',
    gradient: 'from-slate-600 to-slate-800',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop'
  },
  other: {
    emoji: '✨',
    gradient: 'from-purple-500 to-violet-600',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop'
  },
};

// Status badge component - Airbnb style
function StatusBadge({ status }: { status: PartyStatus }) {
  const config: Record<PartyStatus, { label: string; className: string }> = {
    planning: { label: 'Planning', className: 'bg-gray-900 text-white' },
    booked: { label: 'Booked', className: 'bg-amber-500 text-white' },
    confirmed: { label: 'Confirmed', className: 'bg-green-600 text-white' },
    completed: { label: 'Completed', className: 'bg-gray-500 text-white' },
    cancelled: { label: 'Cancelled', className: 'bg-red-500 text-white' },
  };

  const { label, className } = config[status];

  return (
    <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide', className)}>
      {label}
    </span>
  );
}

// Airbnb-style stat card
function StatCard({
  label,
  value,
  subtext,
  trend,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {trend !== undefined && (
          <span className={cn(
            'text-xs font-medium flex items-center gap-0.5 mb-1',
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            <TrendingUp className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

// Airbnb-style party card with image
function PartyCard({ party }: { party: Party }) {
  const [copied, setCopied] = useState(false);
  const config = partyTypeConfig[party.party_type] || partyTypeConfig.other;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (party.share_token) {
      const url = getPartyShareUrl(party.share_token);
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const partyDate = party.party_date
    ? new Date(party.party_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'No date';

  const partyName = party.party_name || `${party.honoree_name}'s Party`;

  return (
    <Link
      href={`/p/${party.share_token}`}
      target="_blank"
      className="group block"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
        <Image
          src={config.image}
          alt={partyName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={party.status as PartyStatus} />
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full transition-all',
            copied
              ? 'bg-green-500 text-white'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:scale-105'
          )}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Party Type Emoji */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-xl">
          {config.emoji}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] text-gray-900 leading-tight line-clamp-1">
            {partyName}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{partyDate}</span>
          <span className="text-gray-300">•</span>
          <Users className="w-3.5 h-3.5" />
          <span>{party.guest_count} guests</span>
        </div>

        <p className="text-sm mt-1">
          <span className="text-gray-500 capitalize">{party.party_type.replace('_', ' ')}</span>
          {party.location && (
            <>
              <span className="text-gray-300 mx-1">•</span>
              <span className="text-gray-500">{party.location}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

// Main Dashboard Component
export default function PartnerDashboardPage() {
  const router = useRouter();
  const { partner, isLoading: sessionLoading, isAuthenticated, isPartner } = usePartnerSession();
  const { mutate: logout } = usePartnerLogout();

  // Redirect if not authenticated
  useEffect(() => {
    if (!sessionLoading && (!isAuthenticated || !isPartner)) {
      router.push('/partner-portal/login');
    }
  }, [sessionLoading, isAuthenticated, isPartner, router]);

  // Fetch partner's parties
  const { data: parties, isLoading: partiesLoading } = usePartiesByPartner(partner?.id);

  // Fetch partner stats
  const { data: stats, isLoading: statsLoading } = usePartyStats(partner?.id);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push('/partner-portal/login');
      },
    });
  };

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Airbnb-style Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {partner.logo_url ? (
                <img src={partner.logo_url} alt={partner.name} className="h-8 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                    <PartyPopper className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">{partner.name}</span>
                </div>
              )}
            </div>

            {/* Center - Search/Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <button className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                Dashboard
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                Parties
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                Analytics
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/partner-portal/parties/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Party</span>
              </Link>

              <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome + Quick Create */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h1>
            <p className="text-gray-500 mt-1">
              Here's what's happening with your party referrals
            </p>
          </div>
        </div>

        {/* Stats Grid - Cleaner Airbnb style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Parties"
            value={stats?.total || 0}
          />
          <StatCard
            label="In Planning"
            value={stats?.planning || 0}
          />
          <StatCard
            label="Confirmed"
            value={(stats?.booked || 0) + (stats?.confirmed || 0)}
          />
          <StatCard
            label="Commission Earned"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            trend={12}
            subtext="vs last month"
          />
        </div>

        {/* CTA Banner - Cleaner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
            <Sparkles className="w-full h-full" />
          </div>
          <div className="relative">
            <h2 className="text-xl font-semibold text-white mb-2">Create a Party Link</h2>
            <p className="text-gray-300 mb-5 max-w-lg text-sm">
              Generate a personalized party link for your upcoming guests. They'll get AI-powered recommendations for their Austin celebration.
            </p>
            <Link
              href="/partner-portal/parties/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 font-medium rounded-full hover:shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Party
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Parties - Photo Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Parties</h2>
            <Link
              href="/partner-portal/parties"
              className="text-sm font-medium text-gray-900 hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {partiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] rounded-xl bg-gray-200 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : parties && parties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parties.slice(0, 6).map((party) => (
                <PartyCard key={party.id} party={party} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No parties yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                Create your first party link to start helping your guests plan their Austin celebration.
              </p>
              <Link
                href="/partner-portal/parties/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Party
              </Link>
            </div>
          )}
        </div>

        {/* Commission Info - Minimal */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Earn {partner.commission_rate}% Commission
              </h3>
              <p className="text-gray-500 text-sm mt-0.5">
                On every booking your guests make. Paid monthly via direct deposit.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
