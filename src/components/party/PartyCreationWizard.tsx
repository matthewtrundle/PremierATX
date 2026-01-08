// Party Creation Wizard
// Multi-step form for creating a new party booking

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { useCreateParty } from '@/hooks/useParties';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { PartyType, BudgetRange, PartyInsert, PartyPreferences } from '@/types/partyPlanning';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Sparkles,
  PartyPopper,
  Heart,
  Music,
  Utensils,
  Camera,
  Car,
  Check,
  Loader2,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/party-design-tokens.css';

// Wizard steps
const STEPS = ['basics', 'preferences', 'contact', 'confirm'] as const;
type WizardStep = typeof STEPS[number];

// Party type options
const partyTypes: { type: PartyType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'bachelor', label: 'Bachelor Party', icon: PartyPopper, description: 'Epic celebration for the groom-to-be' },
  { type: 'bachelorette', label: 'Bachelorette Party', icon: Heart, description: 'Unforgettable celebration for the bride-to-be' },
  { type: 'other', label: 'Other Celebration', icon: Sparkles, description: 'Birthday, reunion, or other group event' },
];

// Budget options
const budgetOptions: { range: BudgetRange; label: string; perPerson: string; description: string }[] = [
  { range: 'budget', label: 'Budget-Friendly', perPerson: '$50-100', description: 'Great experiences without breaking the bank' },
  { range: 'moderate', label: 'Moderate', perPerson: '$100-200', description: 'Nice balance of quality and value' },
  { range: 'premium', label: 'Premium', perPerson: '$200-400', description: 'Elevated experiences with extra perks' },
  { range: 'luxury', label: 'Luxury', perPerson: '$400+', description: 'No expense spared, VIP treatment' },
];

// Vibe options
const vibeOptions = [
  { value: 'wild', label: 'Wild & Crazy', emoji: '🎉' },
  { value: 'chill', label: 'Chill & Relaxed', emoji: '😎' },
  { value: 'adventurous', label: 'Adventurous', emoji: '🏄' },
  { value: 'classy', label: 'Classy & Upscale', emoji: '🥂' },
  { value: 'outdoorsy', label: 'Outdoorsy', emoji: '🌲' },
  { value: 'foodie', label: 'Foodie', emoji: '🍽️' },
];

// Activity options
const activityOptions = [
  { value: 'bar_crawl', label: 'Bar Crawl', icon: Music },
  { value: 'boat_party', label: 'Boat Party', icon: PartyPopper },
  { value: 'private_chef', label: 'Private Chef', icon: Utensils },
  { value: 'spa_day', label: 'Spa Day', icon: Sparkles },
  { value: 'outdoor_adventure', label: 'Outdoor Adventure', icon: MapPin },
  { value: 'live_music', label: 'Live Music', icon: Music },
  { value: 'photography', label: 'Photography', icon: Camera },
  { value: 'transportation', label: 'Party Transport', icon: Car },
];

interface WizardFormData {
  partyType: PartyType | null;
  partyDate: string;
  guestCount: number;
  budgetRange: BudgetRange | null;
  honoreeName: string;
  partyName: string;
  location: string;
  vibes: string[];
  activities: string[];
  specialRequests: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
}

const initialFormData: WizardFormData = {
  partyType: null,
  partyDate: '',
  guestCount: 10,
  budgetRange: null,
  honoreeName: '',
  partyName: '',
  location: 'Austin, TX',
  vibes: [],
  activities: [],
  specialRequests: '',
  organizerName: '',
  organizerEmail: '',
  organizerPhone: '',
};

export function PartyCreationWizard() {
  const navigate = useNavigate();
  const { partner, primaryColor, getPartnerPath } = useVRPartnerContext();
  const createParty = useCreateParty();

  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof WizardFormData, string>>>({});

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Update form data
  const updateField = useCallback(<K extends keyof WizardFormData>(
    field: K,
    value: WizardFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  // Toggle multi-select options
  const toggleOption = useCallback((field: 'vibes' | 'activities', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  }, []);

  // Validate current step
  const validateStep = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof WizardFormData, string>> = {};

    switch (currentStep) {
      case 'basics':
        if (!formData.partyType) newErrors.partyType = 'Please select a party type';
        if (!formData.partyDate) newErrors.partyDate = 'Please select a date';
        if (formData.guestCount < 2) newErrors.guestCount = 'Minimum 2 guests required';
        break;
      case 'preferences':
        if (!formData.budgetRange) newErrors.budgetRange = 'Please select a budget range';
        break;
      case 'contact':
        if (!formData.organizerName.trim()) newErrors.organizerName = 'Name is required';
        if (!formData.organizerEmail.trim()) newErrors.organizerEmail = 'Email is required';
        if (formData.organizerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizerEmail)) {
          newErrors.organizerEmail = 'Please enter a valid email';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  // Navigate to next step
  const goNext = useCallback(() => {
    if (!validateStep()) return;
    const nextIndex = Math.min(currentStepIndex + 1, STEPS.length - 1);
    setCurrentStep(STEPS[nextIndex]);
  }, [currentStepIndex, validateStep]);

  // Navigate to previous step
  const goBack = useCallback(() => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(STEPS[prevIndex]);
  }, [currentStepIndex]);

  // Submit the party
  const handleSubmit = useCallback(async () => {
    if (!validateStep()) return;

    const preferences: PartyPreferences = {
      vibe: formData.vibes,
      activities: formData.activities,
      dietary_restrictions: [],
      must_haves: [],
      avoid: [],
    };

    const partyInsert: PartyInsert = {
      vr_partner_id: partner?.id,
      party_type: formData.partyType!,
      party_date: formData.partyDate,
      guest_count: formData.guestCount,
      budget_range: formData.budgetRange!,
      party_name: formData.partyName || `${formData.honoreeName}'s ${formData.partyType === 'bachelor' ? 'Bachelor' : formData.partyType === 'bachelorette' ? 'Bachelorette' : ''} Party`,
      honoree_name: formData.honoreeName || undefined,
      location: formData.location,
      preferences,
      special_requests: formData.specialRequests || undefined,
      organizer_name: formData.organizerName,
      organizer_email: formData.organizerEmail,
      organizer_phone: formData.organizerPhone || undefined,
    };

    try {
      const party = await createParty.mutateAsync(partyInsert);
      // Navigate to the party hub or vendor browsing
      navigate(getPartnerPath(`/party/${party.id}`));
    } catch (error) {
      // Error is handled by the mutation
    }
  }, [validateStep, formData, partner, createParty, navigate, getPartnerPath]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-8">
            {/* Party Type Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                What are we celebrating?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {partyTypes.map(({ type, label, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => updateField('partyType', type)}
                    className={cn(
                      'p-6 rounded-2xl border-2 text-left transition-all',
                      formData.partyType === type
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-8 h-8 mb-3" style={{ color: formData.partyType === type ? primaryColor : undefined }} />
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500 mt-1">{description}</div>
                  </button>
                ))}
              </div>
              {errors.partyType && (
                <p className="text-red-500 text-sm mt-2">{errors.partyType}</p>
              )}
            </div>

            {/* Honoree Name */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Who's the guest of honor? (optional)
              </label>
              <input
                type="text"
                value={formData.honoreeName}
                onChange={(e) => updateField('honoreeName', e.target.value)}
                placeholder="e.g., Sarah, Jake, The Birthday King"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-base"
              />
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                <Calendar className="inline w-5 h-5 mr-2" />
                When's the party?
              </label>
              <input
                type="date"
                value={formData.partyDate}
                onChange={(e) => updateField('partyDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-base"
              />
              {errors.partyDate && (
                <p className="text-red-500 text-sm mt-2">{errors.partyDate}</p>
              )}
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                <Users className="inline w-5 h-5 mr-2" />
                How many guests?
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateField('guestCount', Math.max(2, formData.guestCount - 1))}
                  className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 touch-target"
                >
                  -
                </button>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{formData.guestCount}</div>
                  <div className="text-sm text-gray-500">guests</div>
                </div>
                <button
                  onClick={() => updateField('guestCount', formData.guestCount + 1)}
                  className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 touch-target"
                >
                  +
                </button>
              </div>
              {errors.guestCount && (
                <p className="text-red-500 text-sm mt-2">{errors.guestCount}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                <MapPin className="inline w-5 h-5 mr-2" />
                Where in Austin?
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Austin, TX"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-base"
              />
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-8">
            {/* Budget Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                <DollarSign className="inline w-5 h-5 mr-2" />
                What's your budget per person?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {budgetOptions.map(({ range, label, perPerson, description }) => (
                  <button
                    key={range}
                    onClick={() => updateField('budgetRange', range)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      formData.budgetRange === range
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-gray-900">{label}</div>
                      <div className="text-sm font-medium" style={{ color: primaryColor }}>{perPerson}</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{description}</div>
                  </button>
                ))}
              </div>
              {errors.budgetRange && (
                <p className="text-red-500 text-sm mt-2">{errors.budgetRange}</p>
              )}
            </div>

            {/* Vibe Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                What's the vibe? (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {vibeOptions.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => toggleOption('vibes', value)}
                    className={cn(
                      'px-4 py-2.5 rounded-full border transition-all text-sm font-medium',
                      formData.vibes.includes(value)
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="mr-1">{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                What activities interest you? (select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activityOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => toggleOption('activities', value)}
                    className={cn(
                      'p-3 rounded-xl border transition-all text-center',
                      formData.activities.includes(value)
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Any special requests? (optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => updateField('specialRequests', e.target.value)}
                placeholder="Dietary restrictions, accessibility needs, surprises you're planning..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-base resize-none"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there!</h2>
              <p className="text-gray-500">Tell us how to reach you</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Your name
              </label>
              <input
                type="text"
                value={formData.organizerName}
                onChange={(e) => updateField('organizerName', e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-base"
              />
              {errors.organizerName && (
                <p className="text-red-500 text-sm mt-1">{errors.organizerName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email address
              </label>
              <input
                type="email"
                value={formData.organizerEmail}
                onChange={(e) => updateField('organizerEmail', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-base"
              />
              {errors.organizerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.organizerEmail}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone number (optional)
              </label>
              <input
                type="tel"
                value={formData.organizerPhone}
                onChange={(e) => updateField('organizerPhone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-base"
              />
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}>
                <Check className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review your party</h2>
              <p className="text-gray-500">Make sure everything looks good</p>
            </div>

            {/* Summary Card */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.partyName || `${formData.honoreeName ? `${formData.honoreeName}'s ` : ''}${
                      formData.partyType === 'bachelor' ? 'Bachelor Party' :
                      formData.partyType === 'bachelorette' ? 'Bachelorette Party' :
                      'Celebration'
                    }`}
                  </div>
                  {formData.honoreeName && (
                    <div className="text-sm text-gray-500">Celebrating {formData.honoreeName}</div>
                  )}
                </div>
                <div className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                  {partyTypes.find(p => p.type === formData.partyType)?.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-medium text-gray-900">
                    {formData.partyDate ? new Date(formData.partyDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Guests</div>
                  <div className="font-medium text-gray-900">{formData.guestCount} people</div>
                </div>
                <div>
                  <div className="text-gray-500">Location</div>
                  <div className="font-medium text-gray-900">{formData.location}</div>
                </div>
                <div>
                  <div className="text-gray-500">Budget</div>
                  <div className="font-medium text-gray-900">
                    {budgetOptions.find(b => b.range === formData.budgetRange)?.label}
                  </div>
                </div>
              </div>

              {formData.vibes.length > 0 && (
                <div>
                  <div className="text-gray-500 text-sm mb-2">Vibes</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.vibes.map(v => (
                      <span key={v} className="px-2 py-1 bg-white rounded-full text-xs text-gray-700">
                        {vibeOptions.find(opt => opt.value === v)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.activities.length > 0 && (
                <div>
                  <div className="text-gray-500 text-sm mb-2">Interests</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.activities.map(a => (
                      <span key={a} className="px-2 py-1 bg-white rounded-full text-xs text-gray-700">
                        {activityOptions.find(opt => opt.value === a)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-sm text-gray-500 mb-2">Contact</div>
              <div className="font-medium text-gray-900">{formData.organizerName}</div>
              <div className="text-gray-600">{formData.organizerEmail}</div>
              {formData.organizerPhone && (
                <div className="text-gray-600">{formData.organizerPhone}</div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <PartnerLayout useNewNav showBottomNav={false}>
      <div className="party-theme min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <React.Fragment key={step}>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      index <= currentStepIndex
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-400'
                    )}
                    style={index <= currentStepIndex ? { backgroundColor: primaryColor } : undefined}
                  >
                    {index < currentStepIndex ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-1 mx-2 rounded-full transition-colors',
                        index < currentStepIndex ? '' : 'bg-gray-100'
                      )}
                      style={index < currentStepIndex ? { backgroundColor: primaryColor } : undefined}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step Title */}
            <h1 className="text-xl font-semibold text-gray-900">
              {currentStep === 'basics' && 'Party Details'}
              {currentStep === 'preferences' && 'Your Preferences'}
              {currentStep === 'contact' && 'Contact Info'}
              {currentStep === 'confirm' && 'Confirm & Create'}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          {renderStepContent()}
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={isFirstStep}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors',
                isFirstStep
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={createParty.isPending}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {createParty.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Party
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

export default PartyCreationWizard;
