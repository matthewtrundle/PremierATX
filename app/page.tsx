'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              Premier<span className="text-pink-400">ATX</span>
            </h1>
            <p className="text-xl sm:text-2xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Plan your perfect Austin bachelor or bachelorette party with curated vendors, activities, and experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/home"
                className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Start Planning
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all border border-white/30"
              >
                Explore Austin
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything You Need for the Perfect Party
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-purple-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl p-8 sm:p-12 text-center border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Plan Your Party?
          </h2>
          <p className="text-purple-200 mb-8 max-w-xl mx-auto">
            Our AI-powered concierge can help you build the perfect itinerary for your Austin celebration.
          </p>
          <Link
            href="/home"
            className="inline-block px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-purple-300 text-sm">
              &copy; 2024 PremierATX. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/admin" className="text-purple-300 hover:text-white text-sm transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '🏠',
    title: 'Vacation Rentals',
    description: 'Luxury homes with pools, hot tubs, and stunning views perfect for your group.',
  },
  {
    icon: '🍹',
    title: 'Catering & Chefs',
    description: 'Private chefs, BBQ, tacos, and more delivered right to your rental.',
  },
  {
    icon: '🎵',
    title: 'Entertainment',
    description: 'DJs, live music, and performers to keep the party going all night.',
  },
  {
    icon: '🚤',
    title: 'Lake Activities',
    description: 'Boat rentals on Lake Travis for the ultimate Austin experience.',
  },
  {
    icon: '🚐',
    title: 'Transportation',
    description: 'Party buses, limos, and shuttles to get your crew around safely.',
  },
  {
    icon: '🤖',
    title: 'AI Planning',
    description: 'Our AI concierge helps you build the perfect itinerary in minutes.',
  },
];
