// Party Hub - Central Party Management Page
// Visual timeline, bookings, guest management, and cart integration

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePartyWithDetails, useUpdateParty } from '@/hooks/useParties';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { usePartyCart } from '@/hooks/usePartyCart';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { CartSheet, CartSummaryBar } from '@/components/cart/MultiVendorCart';
import { BottomSheet, ConfirmSheet, ActionSheet } from '@/components/ui/BottomSheet';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  ChevronRight,
  ChevronLeft,
  Edit,
  Trash2,
  Share,
  Copy,
  Check,
  Star,
  Loader2,
  PartyPopper,
  ChefHat,
  Music,
  Camera,
  Car,
  Anchor,
  Flower2 as Spa,
  Map as Compass,
  Paintbrush as Palette,
  MoreVertical,
  Mail,
  Phone,
  UserPlus,
  ExternalLink,
  Tag,
  Sparkles,
} from 'lucide-react';
import '@/styles/party-design-tokens.css';

// Vendor type icons
const vendorTypeIcons: Record<string, React.ElementType> = {
  catering: ChefHat,
  dj: Music,
  entertainment: PartyPopper,
  photography: Camera,
  transportation: Car,
  activities: Anchor,
  spa: Spa,
  tours: Compass,
  decor: Palette,
};

// Format helpers
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatShortDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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
const statusColors: Record<string, { bg: string; text: string }> = {
  planning: { bg: 'bg-blue-100', text: 'text-blue-700' },
  booked: { bg: 'bg-amber-100', text: 'text-amber-700' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

export function PartyHub() {
  const { partyId } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();
  const { isCartOpen, closeCart, openCart, totals, setPartyId } = usePartyCart();

  // State
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'guests'>('timeline');

  // Fetch party data
  const { data: party, isLoading, error } = usePartyWithDetails(partyId);

  // Set party ID in cart when party loads
  React.useEffect(() => {
    if (party?.id) {
      setPartyId(party.id);
    }
  }, [party?.id, setPartyId]);

  // Calculate totals
  const partyTotals = useMemo(() => {
    if (!party?.bookings) return { subtotal: 0, retail: 0, savings: 0 };

    const subtotal = party.bookings.reduce((sum, b) => sum + (b.guest_pays || 0), 0);
    const retail = party.bookings.reduce((sum, b) => sum + (b.retail_value || b.guest_pays || 0), 0);

    return {
      subtotal,
      retail,
      savings: retail - subtotal,
    };
  }, [party?.bookings]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    if (!party?.bookings) return new Map();

    const grouped = new Map<string, typeof party.bookings>();

    party.bookings.forEach((booking) => {
      const date = booking.service_date;
      const existing = grouped.get(date) || [];
      grouped.set(date, [...existing, booking]);
    });

    // Sort by date
    return new Map([...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [party?.bookings]);

  // Handle copy share link
  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <PartnerLayout useNewNav showBottomNav>
        <div className="party-theme font-inter min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading party details...</p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  // Error/not found state
  if (!party || error) {
    return (
      <PartnerLayout useNewNav showBottomNav>
        <div className="party-theme font-inter min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Party Not Found</h2>
            <p className="text-gray-500 mb-6">
              We couldn't find this party. It may have been cancelled or the link is incorrect.
            </p>
            <Link
              to={getPartnerPath('/my-parties')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              View My Parties
            </Link>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  const statusStyle = statusColors[party.status] || statusColors.planning;

  return (
    <PartnerLayout useNewNav showBottomNav>
      <div className="party-theme font-inter pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShareSheet(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Share className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setShowActionsSheet(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Party Overview */}
        <section className="max-w-4xl mx-auto px-4 py-6">
          {/* Party Name & Status */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {party.party_name || `${party.honoree_name}'s ${party.party_type === 'bachelor' ? 'Bachelor' : 'Bachelorette'} Party`}
                </h1>
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium capitalize', statusStyle.bg, statusStyle.text)}>
                  {party.status}
                </span>
              </div>
              <p className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(party.party_date)}
                {party.party_end_date && party.party_end_date !== party.party_date && (
                  <> - {formatShortDate(party.party_end_date)}</>
                )}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Users className="w-4 h-4" />
                Guests
              </div>
              <div className="text-xl font-bold text-gray-900">{party.guest_count}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <div className="text-lg font-semibold text-gray-900 truncate">{party.location}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                Total
              </div>
              <div className="text-xl font-bold text-gray-900">{formatPrice(partyTotals.subtotal)}</div>
            </div>
            {partyTotals.savings > 0 && (
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                  <Tag className="w-4 h-4" />
                  Savings
                </div>
                <div className="text-xl font-bold text-green-700">{formatPrice(partyTotals.savings)}</div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('timeline')}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'timeline'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Timeline & Bookings
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'guests'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Guest List ({party.guests?.length || 0})
            </button>
          </div>

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-8">
              {/* Add vendors CTA if no bookings */}
              {(!party.bookings || party.bookings.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors booked yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Browse our curated vendors to add catering, entertainment, activities, and more to your party!
                  </p>
                  <Link
                    to={getPartnerPath('/vendors')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-5 h-5" />
                    Browse Vendors
                  </Link>
                </div>
              )}

              {/* Bookings by Date */}
              {bookingsByDate.size > 0 && (
                <>
                  {Array.from(bookingsByDate.entries()).map(([date, bookings]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {new Date(date).getDate()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{formatShortDate(date)}</div>
                          <div className="text-sm text-gray-500">
                            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Bookings List */}
                      <div className="ml-5 pl-8 border-l-2 border-gray-200 space-y-4">
                        {bookings.map((booking) => {
                          const Icon = vendorTypeIcons[booking.vendor?.vendor_type || 'entertainment'] || PartyPopper;

                          return (
                            <div
                              key={booking.id}
                              className="relative p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              {/* Timeline dot */}
                              <div className="absolute -left-[2.1rem] top-6 w-3 h-3 rounded-full bg-white border-2 border-gray-300" />

                              <div className="flex gap-4">
                                {/* Vendor Image/Icon */}
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                  {booking.vendor?.cover_image_url ? (
                                    <img
                                      src={booking.vendor.cover_image_url}
                                      alt={booking.vendor.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Icon className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{booking.vendor?.name}</h4>
                                      <p className="text-sm text-gray-500 capitalize">
                                        {booking.vendor?.vendor_type?.replace('_', ' ')}
                                        {booking.package && ` • ${booking.package.name}`}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="font-semibold text-gray-900">{formatPrice(booking.guest_pays)}</div>
                                      {booking.retail_value && booking.retail_value > booking.guest_pays && (
                                        <div className="text-xs text-green-600">
                                          Save {formatPrice(booking.retail_value - booking.guest_pays)}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Time & Status */}
                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                                    {booking.service_time_start && (
                                      <span className="flex items-center gap-1 text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatTime(booking.service_time_start)}
                                        {booking.service_time_end && ` - ${formatTime(booking.service_time_end)}`}
                                      </span>
                                    )}
                                    <span
                                      className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                                        booking.status === 'confirmed' || booking.status === 'paid'
                                          ? 'bg-green-100 text-green-700'
                                          : booking.status === 'cancelled'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-amber-100 text-amber-700'
                                      )}
                                    >
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Add More Vendors */}
                  <div className="pt-4">
                    <Link
                      to={getPartnerPath('/vendors')}
                      className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add More Vendors
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Guests Tab */}
          {activeTab === 'guests' && (
            <div className="space-y-4">
              {/* Organizer */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {party.organizer_name?.charAt(0) || 'O'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{party.organizer_name || 'Organizer'}</span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                        Organizer
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{party.organizer_email}</p>
                  </div>
                </div>
              </div>

              {/* Guest List */}
              {party.guests && party.guests.length > 0 ? (
                <div className="space-y-3">
                  {party.guests.map((guest) => (
                    <div key={guest.id} className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                          {guest.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{guest.name}</span>
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                                guest.rsvp_status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : guest.rsvp_status === 'declined'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                              )}
                            >
                              {guest.rsvp_status}
                            </span>
                          </div>
                          {guest.email && (
                            <p className="text-sm text-gray-500 truncate">{guest.email}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {guest.payment_status === 'paid' ? (
                              <span className="text-green-600 font-medium">Paid</span>
                            ) : guest.amount_owed > 0 ? (
                              <span className="text-amber-600">{formatPrice(guest.amount_owed)} due</span>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No guests added yet</h3>
                  <p className="text-gray-500 mb-6">Add guests to collect RSVPs and split costs.</p>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <UserPlus className="w-5 h-5" />
                    Add Guests
                  </button>
                </div>
              )}

              {/* Add Guest Button */}
              {party.guests && party.guests.length > 0 && (
                <button className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                  <UserPlus className="w-5 h-5" />
                  Add Guest
                </button>
              )}
            </div>
          )}
        </section>

        {/* Cart Summary Bar */}
        {totals.itemCount > 0 && (
          <CartSummaryBar onClick={openCart} />
        )}

        {/* Cart Sheet */}
        <CartSheet isOpen={isCartOpen} onClose={closeCart} />

        {/* Share Sheet */}
        <BottomSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          title="Share Party"
          snapPoints={[40]}
        >
          <div className="space-y-4">
            <p className="text-gray-500 text-center">
              Share this link with your party guests so they can view the itinerary and RSVP.
            </p>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{ minHeight: '48px' }}
            >
              {linkCopied ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </BottomSheet>

        {/* Actions Sheet */}
        <ActionSheet
          isOpen={showActionsSheet}
          onClose={() => setShowActionsSheet(false)}
          title="Party Options"
          options={[
            {
              label: 'Edit Party Details',
              icon: Edit,
              onClick: () => navigate(getPartnerPath(`/plan/basics?edit=${party.id}`)),
            },
            {
              label: 'Contact Organizer',
              icon: Mail,
              onClick: () => window.location.href = `mailto:${party.organizer_email}`,
            },
            {
              label: 'Cancel Party',
              icon: Trash2,
              onClick: () => {}, // Would open confirm dialog
              destructive: true,
            },
          ]}
        />
      </div>
    </PartnerLayout>
  );
}

export default PartyHub;
