// My Parties - List of User's Parties
// Shows all parties for the current user/organizer

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartiesByOrganizer } from '@/hooks/useParties';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { Party } from '@/types/partyPlanning';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Plus,
  ChevronRight,
  PartyPopper,
  Loader2,
  Filter,
  Search,
  Clock,
} from 'lucide-react';
import '@/styles/party-design-tokens.css';

// Format helpers
const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Status badge colors
const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Planning' },
  booked: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Booked' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

// Party Card Component
interface PartyCardProps {
  party: Party;
  primaryColor: string;
  onClick: () => void;
}

function PartyCard({ party, primaryColor, onClick }: PartyCardProps) {
  const status = statusColors[party.status] || statusColors.planning;
  const isPast = new Date(party.party_date) < new Date();
  const bookingsCount = (party as any).bookings?.length || 0;
  const guestsCount = (party as any).guests?.length || 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all',
        isPast && 'opacity-70'
      )}
    >
      <div className="flex gap-4">
        {/* Party Icon */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
            party.party_type === 'bachelor' ? 'bg-blue-100' : 'bg-pink-100'
          )}
        >
          <PartyPopper
            className={cn(
              'w-7 h-7',
              party.party_type === 'bachelor' ? 'text-blue-600' : 'text-pink-600'
            )}
          />
        </div>

        {/* Party Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {party.party_name || `${party.honoree_name}'s Party`}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {party.party_type === 'bachelor' ? 'Bachelor' : 'Bachelorette'} Party
              </p>
            </div>
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', status.bg, status.text)}>
              {status.label}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(party.party_date)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {party.guest_count} guests
            </span>
            {party.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {party.location}
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              {bookingsCount} vendor{bookingsCount !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500">
              {guestsCount} RSVP{guestsCount !== 1 ? 's' : ''}
            </span>
            {party.total_amount > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="font-medium text-gray-900">{formatPrice(party.total_amount)}</span>
              </>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
      </div>
    </button>
  );
}

export function MyParties() {
  const navigate = useNavigate();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();

  // TODO: Get user email from auth context
  const userEmail = 'demo@example.com';
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch parties
  const { data: parties, isLoading } = usePartiesByOrganizer(userEmail);

  // Filter parties
  const filteredParties = React.useMemo(() => {
    if (!parties) return [];

    let filtered = parties;

    // Filter by time
    const now = new Date();
    if (filter === 'upcoming') {
      filtered = filtered.filter((p) => new Date(p.party_date) >= now && p.status !== 'cancelled');
    } else if (filter === 'past') {
      filtered = filtered.filter((p) => new Date(p.party_date) < now || p.status === 'completed');
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.party_name?.toLowerCase().includes(query) ||
          p.honoree_name?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [parties, filter, searchQuery]);

  // Group parties by upcoming/past
  const upcomingParties = filteredParties.filter(
    (p) => new Date(p.party_date) >= new Date() && p.status !== 'cancelled' && p.status !== 'completed'
  );
  const pastParties = filteredParties.filter(
    (p) => new Date(p.party_date) < new Date() || p.status === 'completed' || p.status === 'cancelled'
  );

  return (
    <PartnerLayout useNewNav showBottomNav>
      <div className="party-theme font-inter pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">My Parties</h1>
              <Link
                to={getPartnerPath('/plan')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Party</span>
              </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search parties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setFilter('upcoming')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    filter === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  )}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    filter === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  )}
                >
                  Past
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  )}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!parties || parties.length === 0) && (
            <div className="text-center py-16">
              <PartyPopper className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No parties yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start planning your first bachelor or bachelorette party with our curated vendors!
              </p>
              <Link
                to={getPartnerPath('/plan')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-5 h-5" />
                Plan a Party
              </Link>
            </div>
          )}

          {/* No Results */}
          {!isLoading && parties && parties.length > 0 && filteredParties.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No parties found</h3>
              <p className="text-gray-500">
                {searchQuery ? `No parties match "${searchQuery}"` : 'No parties match your filters'}
              </p>
            </div>
          )}

          {/* Party List */}
          {!isLoading && filteredParties.length > 0 && (
            <div className="space-y-8">
              {/* Upcoming Parties */}
              {filter !== 'past' && upcomingParties.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Upcoming
                  </h2>
                  <div className="space-y-3">
                    {upcomingParties.map((party) => (
                      <PartyCard
                        key={party.id}
                        party={party}
                        primaryColor={primaryColor}
                        onClick={() => navigate(getPartnerPath(`/party/${party.id}`))}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Parties */}
              {filter !== 'upcoming' && pastParties.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Parties</h2>
                  <div className="space-y-3">
                    {pastParties.map((party) => (
                      <PartyCard
                        key={party.id}
                        party={party}
                        primaryColor={primaryColor}
                        onClick={() => navigate(getPartnerPath(`/party/${party.id}`))}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}

export default MyParties;
