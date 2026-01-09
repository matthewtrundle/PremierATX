'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePartnerSession, usePartnerLogin, usePartnerPasswordReset } from '@/hooks/usePartnerAuth';

// Import hero image
import heroImage from '@/assets/hero/party-hero.jpg';

export default function PartnerLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isPartner, isLoading: sessionLoading } = usePartnerSession();
  const { mutate: login, isPending: loginLoading } = usePartnerLogin();
  const { mutate: resetPassword, isPending: resetLoading } = usePartnerPasswordReset();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!sessionLoading && isAuthenticated && isPartner) {
      router.push('/partner-portal/dashboard');
    }
  }, [sessionLoading, isAuthenticated, isPartner, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    login(
      { email, password },
      {
        onSuccess: () => {
          router.push('/partner-portal/dashboard');
        },
        onError: (err) => {
          setError(err.message);
        },
      }
    );
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    resetPassword(email, {
      onSuccess: () => {
        setShowForgotPassword(false);
      },
      onError: (err) => {
        setError(err.message);
      },
    });
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

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src={heroImage}
          alt="Party celebration"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-premier-ink/80 via-premier-ink/60 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Partner Portal
            </div>

            <h1 className="text-4xl font-display font-bold mb-4 leading-tight">
              Grow Your Business with Premier Party Planning
            </h1>

            <p className="text-lg text-white/80 mb-8">
              Create personalized party links for your vacation rental guests and earn commission on every booking.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-premier-accent flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">10% Commission</h3>
                  <p className="text-sm text-white/70">Earn on every booking your guests make</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-premier-accent flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Concierge</h3>
                  <p className="text-sm text-white/70">Automated party planning for your guests</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-premier-accent flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Premium Experience</h3>
                  <p className="text-sm text-white/70">Delight guests with curated Austin vendors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-premier-mist">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-display text-3xl font-bold text-premier-ink">
                Premier<span className="text-premier-accent">ATX</span>
              </span>
            </Link>
            <p className="text-premier-ink-soft mt-2">Partner Portal</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-premier-sand-dark/10 p-8">
            {showForgotPassword ? (
              <>
                <h2 className="text-2xl font-display font-bold text-premier-ink mb-2">
                  Reset Password
                </h2>
                <p className="text-premier-ink-soft mb-6">
                  Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-premier-ink mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourcompany.com"
                        className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:ring-premier-accent focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className={cn(
                      'w-full py-3 bg-premier-accent text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2',
                      resetLoading
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:brightness-105 hover:shadow-md'
                    )}
                  >
                    {resetLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                    }}
                    className="w-full text-center text-sm text-premier-ink-soft hover:text-premier-ink transition-colors"
                  >
                    Back to Sign In
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-display font-bold text-premier-ink mb-2">
                  Welcome Back
                </h2>
                <p className="text-premier-ink-soft mb-6">
                  Sign in to manage your parties and view your earnings.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-premier-ink mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourcompany.com"
                        className="w-full pl-11 pr-4 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:ring-premier-accent focus:border-transparent transition-all"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-premier-ink mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-11 pr-12 py-3 bg-premier-mist/50 border border-premier-sand-dark/20 rounded-xl text-premier-ink focus:outline-none focus:ring-2 focus:ring-premier-accent focus:border-transparent transition-all"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-premier-ink-soft hover:text-premier-ink transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-premier-sand-dark/30 text-premier-accent focus:ring-premier-accent"
                      />
                      <span className="text-sm text-premier-ink-soft">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                      }}
                      className="text-sm text-premier-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={cn(
                      'w-full py-3 bg-premier-accent text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2',
                      loginLoading
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:brightness-105 hover:shadow-md'
                    )}
                  >
                    {loginLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Demo Account Notice */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">Try Demo Account</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Test the partner portal with these credentials:
                </p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Email:</span>
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-800">
                      demo@luxurylakeretreats.com
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Password:</span>
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-800">
                      demo123!
                    </code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@luxurylakeretreats.com');
                    setPassword('demo123!');
                  }}
                  className="mt-3 text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <ArrowRight className="w-3 h-3" />
                  Fill demo credentials
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-premier-ink-soft mt-8">
            Want to become a partner?{' '}
            <Link href="/contact" className="text-premier-accent hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
