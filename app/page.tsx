'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Wine, Car, Ship, MapPin, Home, Sparkles } from 'lucide-react';

const services = [
  {
    icon: Home,
    title: 'Vacation Rentals',
    description: 'Luxury homes with pools, hot tubs, and stunning views perfect for your group.',
    href: '/rentals',
  },
  {
    icon: Wine,
    title: 'Catering & Chefs',
    description: 'Private chefs, BBQ, tacos, and more delivered right to your rental.',
    href: '/catering',
  },
  {
    icon: Sparkles,
    title: 'Entertainment',
    description: 'DJs, live music, and performers to keep the party going all night.',
    href: '/entertainment',
  },
  {
    icon: Ship,
    title: 'Lake Activities',
    description: 'Boat rentals on Lake Travis for the ultimate Austin experience.',
    href: '/boats',
  },
  {
    icon: Car,
    title: 'Transportation',
    description: 'Party buses, limos, and shuttles to get your crew around safely.',
    href: '/transport',
  },
  {
    icon: Calendar,
    title: 'AI Planning',
    description: 'Our AI concierge helps you build the perfect itinerary in minutes.',
    href: '/plan',
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premier-mist">
        <div className="text-premier-ink-soft text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premier-mist">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-premier-ink min-h-[70vh] flex items-center">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-premier-ink via-premier-ink/95 to-premier-ink/90" />

        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-premier-accent blur-3xl" />
          <div className="absolute bottom-40 right-40 w-48 h-48 rounded-full bg-premier-sage blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white mb-6 tracking-tight leading-tight">
              Your Austin
              <br />
              <span className="text-premier-sand">Party Awaits</span>
            </h1>
            <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-lg">
              Plan an unforgettable weekend with Austin's finest vendors, activities, and experiences — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/home"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-premier-accent text-white font-semibold rounded-xl transition-all hover:brightness-110 shadow-lg hover:shadow-xl"
              >
                Start Planning
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all border border-white/20"
              >
                Explore Austin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-premier-ink mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-premier-ink-soft max-w-xl mx-auto">
            From luxury rentals to transportation, we've curated Austin's best vendors for your celebration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group p-6 bg-white rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-premier-sand w-fit mb-4">
                  <Icon className="w-6 h-6 text-premier-accent" />
                </div>
                <h3 className="text-lg font-display font-semibold text-premier-ink mb-2 group-hover:text-premier-accent transition-colors">
                  {service.title}
                </h3>
                <p className="text-premier-ink-soft leading-relaxed">
                  {service.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 pb-24">
        <div className="bg-premier-sand rounded-3xl p-10 sm:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-premier-ink mb-4">
            Ready to Plan Your Party?
          </h2>
          <p className="text-premier-ink-soft mb-8 max-w-xl mx-auto text-lg">
            Let our AI-powered planner help you coordinate vendors, activities, and logistics for an unforgettable experience.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-10 py-4 bg-premier-accent text-white font-semibold rounded-xl transition-all hover:brightness-110 shadow-md hover:shadow-lg"
          >
            Plan with AI
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-premier-sand-dark/20 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-premier-ink">
                Premier<span className="text-premier-accent">ATX</span>
              </span>
            </div>
            <p className="text-premier-ink-soft text-sm">
              &copy; 2024 PremierATX. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/admin" className="text-premier-ink-soft hover:text-premier-ink text-sm transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
