// Top Navigation - Premium Style
// Clean, sophisticated desktop navigation with partner branding

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import {
  Search,
  Menu,
  User,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopNavProps {
  transparent?: boolean;
  className?: string;
  cartItemCount?: number;
}

export function TopNav({ transparent = false, className, cartItemCount = 0 }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { partner, logoUrl, primaryColor, getPartnerPath } = useVRPartnerContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll for sticky header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(getPartnerPath(`/vendors?search=${encodeURIComponent(searchQuery)}`));
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const navLinks = [
    { path: '/vendors', label: 'Browse' },
    { path: '/plan', label: 'Plan' },
    { path: '/my-parties', label: 'My Parties' },
  ];

  // Use terracotta accent as default
  const accentColor = primaryColor || 'hsl(16, 65%, 50%)';

  const showBackground = isScrolled || !transparent;

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          showBackground
            ? 'bg-white/95 backdrop-blur-sm border-b border-premier-sand-dark/20 shadow-sm'
            : 'bg-transparent',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <button
              onClick={() => navigate(getPartnerPath('/'))}
              className="flex items-center flex-shrink-0"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={partner?.name || 'Logo'}
                  className="h-8 lg:h-9 w-auto object-contain"
                />
              ) : (
                <span
                  className={cn(
                    'text-xl lg:text-2xl font-display font-bold tracking-tight',
                    !showBackground && transparent ? 'text-white' : 'text-premier-ink'
                  )}
                >
                  {partner?.name || 'PremierATX'}
                </span>
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(getPartnerPath(link.path))}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    !showBackground && transparent
                      ? 'text-white hover:bg-white/10'
                      : isActive(link.path)
                      ? 'bg-premier-sand text-premier-ink'
                      : 'text-premier-ink-soft hover:bg-premier-mist hover:text-premier-ink'
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-200',
                  !showBackground && transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-premier-ink-soft hover:bg-premier-mist hover:text-premier-ink'
                )}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* AI Planner Button - Desktop */}
              <button
                onClick={() => navigate(getPartnerPath('/plan'))}
                className={cn(
                  'hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  'bg-premier-accent text-white hover:brightness-105 shadow-sm'
                )}
              >
                <Sparkles className="w-4 h-4" />
                Plan with AI
              </button>

              {/* Cart Button */}
              <button
                onClick={() => navigate(getPartnerPath('/party'))}
                className={cn(
                  'relative p-2.5 rounded-xl transition-all duration-200',
                  !showBackground && transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-premier-ink-soft hover:bg-premier-mist hover:text-premier-ink'
                )}
                aria-label="View party"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-white bg-premier-accent">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User Menu Button */}
              <button
                className={cn(
                  'flex items-center gap-2 p-1.5 pl-3 rounded-full border-2 transition-all duration-200',
                  !showBackground && transparent
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-premier-sand-dark/30 text-premier-ink-soft hover:border-premier-sand-dark/50 hover:shadow-md'
                )}
              >
                <Menu className="w-4 h-4" />
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-premier-ink-soft">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  'lg:hidden p-2.5 rounded-xl transition-all duration-200',
                  !showBackground && transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-premier-ink-soft hover:bg-premier-mist'
                )}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-premier-ink/40 backdrop-blur-sm flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-premier-ink-soft" />
              <input
                type="text"
                placeholder="Search vendors, activities, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-14 pr-14 py-5 text-lg text-premier-ink placeholder:text-premier-ink-soft/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-premier-mist transition-colors"
              >
                <X className="w-5 h-5 text-premier-ink-soft" />
              </button>
            </form>
            <div className="border-t border-premier-sand-dark/20 px-6 py-4">
              <p className="text-sm text-premier-ink-soft">
                Try "boat rental", "private chef", or "DJ"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-premier-ink/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-premier-sand-dark/20">
              <span className="font-display font-semibold text-premier-ink">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-premier-mist transition-colors"
              >
                <X className="w-5 h-5 text-premier-ink-soft" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(getPartnerPath(link.path));
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                    isActive(link.path)
                      ? 'bg-premier-sand text-premier-ink'
                      : 'text-premier-ink-soft hover:bg-premier-mist hover:text-premier-ink'
                  )}
                >
                  {link.label}
                </button>
              ))}
              <hr className="my-4 border-premier-sand-dark/20" />
              <button
                onClick={() => {
                  navigate(getPartnerPath('/plan'));
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-white bg-premier-accent hover:brightness-105 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5" />
                Plan with AI
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default TopNav;
