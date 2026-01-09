import { motion } from 'framer-motion';
import { Calendar, Wine, Car, Ship, MapPin, Home, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero/party-hero.jpg';
import itineraryHero from '@/assets/services/itinerary-hero.jpg';
import alcoholHero from '@/assets/services/alcohol-delivery-hero.jpg';
import transportHero from '@/assets/services/transport-hero.jpg';
import boatsHero from '@/assets/services/boats-hero.jpg';
import exploreHero from '@/assets/services/explore-hero.jpg';
import rentalsHero from '@/assets/services/rentals-hero.jpg';

const services = [
  {
    icon: Calendar,
    title: 'View Itinerary',
    description: 'See your planned activities and reservations',
    href: '/itinerary',
    image: itineraryHero.src
  },
  {
    icon: Wine,
    title: 'Alcohol Delivery',
    description: 'Premium spirits delivered to your location',
    href: '/app/delivery',
    image: alcoholHero.src
  },
  {
    icon: Car,
    title: 'Transportation',
    description: 'Luxury vehicles for group transportation',
    href: '/transport',
    image: transportHero.src
  },
  {
    icon: Ship,
    title: 'Boat Rentals',
    description: 'Austin lake adventures await',
    href: '/boats',
    image: boatsHero.src
  },
  {
    icon: MapPin,
    title: 'Explore Austin',
    description: 'Discover Austin\'s best activities',
    href: '/explore',
    image: exploreHero.src
  },
  {
    icon: Home,
    title: 'Vacation Rentals',
    description: 'Book luxury stays for your group',
    href: '/rentals',
    image: rentalsHero.src
  }
];

export function ConciergeHome() {
  return (
    <div className="min-h-screen pb-24 bg-premier-mist">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <img
          src={heroImage.src}
          alt="Austin party celebration"
          className="w-full h-full object-cover"
        />
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-premier-ink/30 via-premier-ink/40 to-premier-ink/70" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col justify-end px-6 pb-12 sm:pb-16"
        >
          <div className="max-w-4xl mx-auto w-full">
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
              to="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-premier-accent text-white font-medium rounded-xl hover:brightness-105 transition-all shadow-lg hover:shadow-xl"
            >
              Start Planning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Services Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-premier-ink mb-2">
            Everything You Need
          </h2>
          <p className="text-premier-ink-soft">
            From transportation to entertainment, we've got you covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3, duration: 0.4 }}
              >
                <Link to={service.href} className="block group">
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-premier-sand rounded-3xl p-8 sm:p-12 text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-display font-semibold text-premier-ink mb-4">
            Ready to plan your perfect Austin party?
          </h3>
          <p className="text-premier-ink-soft mb-6 max-w-xl mx-auto">
            Let our AI-powered planner help you coordinate vendors,
            activities, and logistics for an unforgettable experience.
          </p>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-premier-accent text-white font-semibold rounded-xl hover:brightness-105 transition-all shadow-md hover:shadow-lg"
          >
            Plan with AI
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
