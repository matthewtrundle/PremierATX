'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  ShoppingCart,
  Car,
  Ship,
  MapPin,
  Wine,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import images from assets
import heroImage from '@/assets/hero/party-hero.jpg';
import itineraryHero from '@/assets/services/itinerary-hero.jpg';
import alcoholHero from '@/assets/services/alcohol-delivery-hero.jpg';
import transportHero from '@/assets/services/transport-hero.jpg';
import boatsHero from '@/assets/services/boats-hero.jpg';
import exploreHero from '@/assets/services/explore-hero.jpg';
import rentalsHero from '@/assets/services/rentals-hero.jpg';

// Service cards data
const services = [
  {
    icon: Calendar,
    title: 'View Itinerary',
    description: 'See your planned activities and reservations',
    href: '/itinerary',
    image: itineraryHero
  },
  {
    icon: Wine,
    title: 'Alcohol Delivery',
    description: 'Premium spirits delivered to your location',
    href: '/delivery',
    image: alcoholHero
  },
  {
    icon: Car,
    title: 'Transportation',
    description: 'Luxury vehicles for group transportation',
    href: '/transport',
    image: transportHero
  },
  {
    icon: Ship,
    title: 'Boat Rentals',
    description: 'Austin lake adventures await',
    href: '/boats',
    image: boatsHero
  },
  {
    icon: MapPin,
    title: 'Explore Austin',
    description: "Discover Austin's best activities",
    href: '/explore',
    image: exploreHero
  },
  {
    icon: Home,
    title: 'Vacation Rentals',
    description: 'Book luxury stays for your group',
    href: '/rentals',
    image: rentalsHero
  }
];

// Bottom navigation items
const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Calendar, label: 'Itinerary', path: '/itinerary' },
  { icon: ShoppingCart, label: 'Delivery', path: '/delivery' },
  { icon: Car, label: 'Transport', path: '/transport' },
  { icon: Ship, label: 'Boats', path: '/boats' },
  { icon: MapPin, label: 'Explore', path: '/explore' },
];

// Bottom Navigation Component
function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-premier-sand-dark/20 z-50 shadow-lg">
      <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path || pathname?.startsWith(path + '/');

          return (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 sm:px-3 rounded-xl transition-all duration-200 relative min-w-0 flex-1",
                isActive
                  ? "text-premier-accent"
                  : "text-premier-ink-soft hover:text-premier-ink"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1 flex-shrink-0 transition-all",
                isActive && "text-premier-accent"
              )} />
              <span className={cn(
                "text-xs text-center line-clamp-1",
                isActive ? "font-semibold" : "font-medium"
              )}>{label}</span>
              {isActive && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-premier-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Service Card Component
function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const Icon = service.icon;

  return (
    <Link
      href={service.href}
      className="block group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-premier-sand relative">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-premier-sand">
              <Icon className="w-5 h-5 text-premier-accent" />
            </div>
            <h3 className="font-display font-semibold text-premier-ink text-base sm:text-lg">
              {service.title}
            </h3>
          </div>
          <p className="text-sm text-premier-ink-soft leading-relaxed">
            {service.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ConciergeHomePage() {
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
    <div className="min-h-screen pb-24 bg-premier-mist">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
        {/* Hero background image */}
        <Image
          src={heroImage}
          alt="Austin party celebration"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-premier-ink/30 via-premier-ink/50 to-premier-ink/80" />

        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 sm:pb-16">
          <div className="max-w-4xl mx-auto w-full animate-fade-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-tight mb-4">
              Your Austin
              <br />
              <span className="text-premier-sand">Party Awaits</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-xl mb-6">
              Plan an unforgettable weekend with Austin's finest vendors,
              activities, and experiences — all in one place.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-premier-accent text-white font-medium rounded-xl hover:brightness-105 transition-all shadow-lg hover:shadow-xl"
            >
              Start Planning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-premier-ink mb-2">
            Everything You Need
          </h2>
          <p className="text-premier-ink-soft">
            From transportation to entertainment, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.href} service={service} index={index} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-premier-sand rounded-3xl p-8 sm:p-12 text-center animate-fade-up">
          <h3 className="text-2xl sm:text-3xl font-display font-semibold text-premier-ink mb-4">
            Ready to plan your perfect Austin party?
          </h3>
          <p className="text-premier-ink-soft mb-6 max-w-xl mx-auto">
            Let our AI-powered planner help you coordinate vendors,
            activities, and logistics for an unforgettable experience.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-premier-accent text-white font-semibold rounded-xl hover:brightness-105 transition-all shadow-md hover:shadow-lg"
          >
            Plan with AI
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
