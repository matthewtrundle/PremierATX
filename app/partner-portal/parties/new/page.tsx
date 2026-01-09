'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Users,
  User,
  Mail,
  PartyPopper,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Heart,
  Briefcase,
  Gift,
  HelpCircle,
  Send,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePartnerSession } from '@/hooks/usePartnerAuth';
import { useCreateParty, getPartyShareUrl } from '@/hooks/useParties';

// Party type options
const partyTypes = [
  {
    value: 'bachelor',
    label: 'Bachelor Party',
    icon: User,
    description: 'Planning a guys\' weekend',
  },
  {
    value: 'bachelorette',
    label: 'Bachelorette Party',
    icon: Heart,
    description: 'Planning a girls\' getaway',
  },
  {
    value: 'other',
    label: 'Other Celebration',
    icon: Gift,
    description: 'Birthday, corporate, reunion, etc.',
  },
];

// Form steps
type FormStep = 'type' | 'details' | 'contact' | 'success';

export default function CreatePartyPage() {
  const router = useRouter();
  const { partner, isLoading: sessionLoading, isAuthenticated, isPartner } = usePartnerSession();
  const { mutate: createParty, isPending: creating } = useCreateParty();

  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>('type');
  const [partyType, setPartyType] = useState<'bachelor' | 'bachelorette' | 'other'>('bachelorette');
  const [partyName, setPartyName] = useState('');
  const [honoreeName, setHonoreeName] = useState('');
  const [partyDate, setPartyDate] = useState('');
  const [partyEndDate, setPartyEndDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [error, setError] = useState('');

  // Created party state
  const [createdParty, setCreatedParty] = useState<{ id: string; shareToken: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!sessionLoading && (!isAuthenticated || !isPartner)) {
      router.push('/partner-portal/login');
    }
  }, [sessionLoading, isAuthenticated, isPartner, router]);

  // Auto-generate party name
  useEffect(() => {
    if (honoreeName && !partyName) {
      const suffix = partyType === 'bachelor' ? 'Bachelor Party' : partyType === 'bachelorette' ? 'Bachelorette' : 'Celebration';
      setPartyName(`${honoreeName}'s ${suffix}`);
    }
  }, [honoreeName, partyType, partyName]);

  const handleSubmit = () => {
    if (!partyDate || !guestCount || !organizerEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');

    createParty(
      {
        vr_partner_id: partner?.id,
        party_type: partyType,
        party_name: partyName || `${honoreeName}'s Party`,
        honoree_name: honoreeName,
        party_date: partyDate,
        party_end_date: partyEndDate || partyDate,
        guest_count: parseInt(guestCount),
        organizer_name: organizerName,
        organizer_email: organizerEmail,
        partner_notes: notes,
        created_by_partner: true,
        status: 'planning',
        location: 'Austin, TX',
      },
      {
        onSuccess: (data) => {
          setCreatedParty({
            id: data.id,
            shareToken: data.share_token,
          });
          setCurrentStep('success');
        },
        onError: (err) => {
          setError(err.message);
        },
      }
    );
  };

  const handleCopyLink = () => {
    if (createdParty?.shareToken) {
      const url = getPartyShareUrl(createdParty.shareToken);
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextStep = () => {
    if (currentStep === 'type') setCurrentStep('details');
    else if (currentStep === 'details') setCurrentStep('contact');
    else if (currentStep === 'contact') handleSubmit();
  };

  const prevStep = () => {
    if (currentStep === 'details') setCurrentStep('type');
    else if (currentStep === 'contact') setCurrentStep('details');
  };

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premier-mist">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-premier-accent flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
          <p className="text-premier-ink-soft font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!partner) return null;

  const primaryColor = partner.branding_config?.primary_color || '#d46836';

  // Success state
  if (currentStep === 'success' && createdParty) {
    const shareUrl = getPartyShareUrl(createdParty.shareToken);

    return (
      <div className="min-h-screen bg-premier-mist flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-sm border border-premier-sand-dark/10 p-8 max-w-lg w-full text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Check className="w-8 h-8" style={{ color: primaryColor }} />
          </div>

          <h1 className="text-2xl font-display font-bold text-premier-ink mb-2">
            Party Created!
          </h1>
          <p className="text-premier-ink-soft mb-6">
            Share this link with your guest so they can start planning their Austin celebration.
          </p>

          {/* Share Link */}
          <div className="bg-premier-mist rounded-2xl p-4 mb-6">
            <label className="text-xs text-premier-ink-soft block mb-2 text-left">
              Shareable Party Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2.5 bg-white border border-premier-sand-dark/20 rounded-xl text-sm text-premier-ink truncate"
              />
              <button
                onClick={handleCopyLink}
                className={cn(
                  'px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all',
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-premier-ink text-white hover:brightness-110'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/p/${createdParty.shareToken}`}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-premier-sand-dark/20 rounded-xl font-medium text-premier-ink hover:bg-premier-sand transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Page
            </Link>
            <Link
              href="/partner-portal/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white transition-all hover:brightness-105"
              style={{ backgroundColor: primaryColor }}
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Email option */}
          {organizerEmail && (
            <div className="mt-6 pt-6 border-t border-premier-sand-dark/10">
              <button
                onClick={() => {
                  // TODO: Implement email sending
                  alert('Email functionality coming soon!');
                }}
                className="flex items-center justify-center gap-2 text-sm text-premier-accent hover:underline mx-auto"
              >
                <Send className="w-4 h-4" />
                Send link to {organizerEmail}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premier-mist">
      {/* Header */}
      <header className="bg-white border-b border-premier-sand-dark/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/partner-portal/dashboard"
              className="flex items-center gap-2 text-premier-ink-soft hover:text-premier-ink transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>

            {/* Progress indicators */}
            <div className="flex items-center gap-2">
              {['type', 'details', 'contact'].map((step, i) => (
                <div
                  key={step}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-colors',
                    currentStep === step || ['type', 'details', 'contact'].indexOf(currentStep) > i
                      ? 'bg-premier-accent'
                      : 'bg-premier-sand-dark/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <Sparkles className="w-4 h-4" />
            New Party
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-premier-ink mb-2">
            {currentStep === 'type' && 'What type of party?'}
            {currentStep === 'details' && 'Party Details'}
            {currentStep === 'contact' && 'Guest Contact Info'}
          </h1>
          <p className="text-premier-ink-soft">
            {currentStep === 'type' && 'Select the type of celebration your guest is planning.'}
            {currentStep === 'details' && 'Tell us about the party so we can personalize their experience.'}
            {currentStep === 'contact' && 'How can we reach the party organizer?'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-premier-sand-dark/10 p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Party Type */}
          {currentStep === 'type' && (
            <div className="space-y-4">
              {partyTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = partyType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setPartyType(type.value as typeof partyType)}
                    className={cn(
                      'w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all',
                      isSelected
                        ? 'border-transparent shadow-md'
                        : 'border-premier-sand-dark/20 hover:border-premier-sand-dark/40'
                    )}
                    style={isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : undefined}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        isSelected ? '' : 'bg-premier-sand'
                      )}
                      style={isSelected ? { backgroundColor: `${primaryColor}20` } : undefined}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: isSelected ? primaryColor : undefined }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-premier-ink">{type.label}</h3>
                      <p className="text-sm text-premier-ink-soft">{type.description}</p>
                    </div>
                    {isSelected && (
                      <div
                        className="ml-auto w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Party Details */}
          {currentStep === 'details' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-premier-ink mb-2">
                  Honoree Name <span className="text-premier-ink-soft">(bride/groom name)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                  <input
                    type="text"
                    value={honoreeName}
                    onChange={(e) => setHonoreeName(e.target.value)}
                    placeholder="Sarah"
                    className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-premier-ink mb-2">
                  Party Name <span className="text-premier-ink-soft">(auto-generated)</span>
                </label>
                <div className="relative">
                  <PartyPopper className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="Sarah's Bachelorette"
                    className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-premier-ink mb-2">
                    Arrival Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                    <input
                      type="date"
                      value={partyDate}
                      onChange={(e) => setPartyDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-premier-ink mb-2">
                    Departure Date
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                    <input
                      type="date"
                      value={partyEndDate}
                      onChange={(e) => setPartyEndDate(e.target.value)}
                      min={partyDate || new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-premier-ink mb-2">
                  Number of Guests <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="12"
                    min="1"
                    max="100"
                    className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-premier-ink mb-2">
                  Notes <span className="text-premier-ink-soft">(optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-premier-ink-soft" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any details about their preferences, requests, or things you've discussed..."
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 'contact' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-premier-ink mb-2">
                  Organizer Name <span className="text-premier-ink-soft">(who booked with you)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                  <input
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="Emily Johnson"
                    className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-premier-ink mb-2">
                  Organizer Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                  <input
                    type="email"
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    placeholder="emily@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
                <p className="text-xs text-premier-ink-soft mt-2">
                  We'll use this to notify you about bookings and for guest communication.
                </p>
              </div>

              <div className="p-4 bg-premier-mist/50 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-5 h-5 rounded border-premier-sand-dark/30 text-premier-accent focus:ring-premier-accent mt-0.5"
                  />
                  <div>
                    <span className="block font-medium text-premier-ink text-sm">
                      Send invite email
                    </span>
                    <span className="block text-xs text-premier-ink-soft mt-0.5">
                      We'll email the party link to the organizer for you
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-premier-sand-dark/10">
            {currentStep !== 'type' ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2.5 text-premier-ink-soft hover:text-premier-ink font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={nextStep}
              disabled={creating || (currentStep === 'details' && (!partyDate || !guestCount))}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all',
                creating ||
                  (currentStep === 'details' && (!partyDate || !guestCount)) ||
                  (currentStep === 'contact' && !organizerEmail)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:brightness-105 hover:shadow-md'
              )}
              style={{ backgroundColor: primaryColor }}
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentStep === 'contact' ? (
                <>
                  Create Party
                  <PartyPopper className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
