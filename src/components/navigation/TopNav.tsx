// Top Navigation - Airbnb Style
// Clean desktop navigation with partner branding

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import {
  Search,
  Menu,
  User,
  ShoppingBag,
  Sparkles,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/party-design-tokens.css';

interface TopNavProps {
  transparent?: boolean; // For overlay on hero sections
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(getPartnerPath(`/vendors?search=${encodeURIComponent(searchQuery)}`));
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    return currentPath.includes(path);
  };

  const navLinks = [
    { path: '/vendors', label: 'Browse Vendors' },
    { path: '/plan', label: 'Plan Party' },
    { path: '/my-parties', label: 'My Parties' },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          transparent
            ? 'bg-transparent'
            : 'bg-white border-b border-gray-200 shadow-sm',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              onClick={() => navigate(getPartnerPath('/'))}
              className="flex items-center flex-shrink-0"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={partner?.name || 'Logo'}
                  className="h-8 lg:h-10 w-auto object-contain"
                />
              ) : (
                <span
                  className={cn(
                    'text-xl lg:text-2xl font-bold',
                    transparent ? 'text-white' : ''
                  )}
                  style={{ color: transparent ? undefined : primaryColor }}
                >
                  {partner?.name || 'Party Plan'}
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
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    transparent
                      ? 'text-white hover:bg-white/10'
                      : isActive(link.path)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                  'p-2.5 rounded-full transition-colors',
                  transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* AI Planner Button - Desktop */}
              <button
                onClick={() => navigate(getPartnerPath('/plan'))}
                className={cn(
                  'hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors',
                  transparent
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'text-white'
                )}
                style={{
                  backgroundColor: transparent ? undefined : primaryColor,
                }}
              >
                <Sparkles className="w-4 h-4" />
                Plan with AI
              </button>

              {/* Cart Button */}
              <button
                onClick={() => navigate(getPartnerPath('/party'))}
                className={cn(
                  'relative p-2.5 rounded-full transition-colors',
                  transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
                aria-label="View party"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User Menu Button */}
              <button
                className={cn(
                  'flex items-center gap-2 p-2 pl-3 rounded-full border transition-colors',
                  transparent
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-gray-200 text-gray-600 hover:shadow-md'
                )}
              >
                <Menu className="w-4 h-4" />
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center',
                    transparent ? 'bg-white/20' : 'bg-gray-500'
                  )}
                >
                  <User className={cn('w-4 h-4', transparent ? 'text-white' : 'text-white')} />
                </div>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  'lg:hidden p-2.5 rounded-full transition-colors',
                  transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors, activities, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-14 pr-14 py-5 text-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </form>
            <div className="border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Try searching for "boat rental", "private chef", or "DJ"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
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
                    'w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive(link.path)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </button>
              ))}
              <hr className="my-4 border-gray-100" />
              <button
                onClick={() => {
                  navigate(getPartnerPath('/plan'));
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
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
