// Bottom Navigation - Mobile Tab Bar
// Clean, sophisticated bottom navigation for mobile devices

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import {
  Home,
  Search,
  Sparkles,
  CalendarDays,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/vendors', label: 'Browse', icon: Search },
    { path: '/plan', label: 'Plan', icon: Sparkles },
    { path: '/my-parties', label: 'Parties', icon: CalendarDays },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '/') {
      return currentPath === getPartnerPath('/') || currentPath.endsWith('/partner/' + location.pathname.split('/partner/')[1]?.split('/')[0]);
    }
    return currentPath.includes(path);
  };

  const handleNavClick = (item: NavItem) => {
    navigate(getPartnerPath(item.path));
  };

  // Use terracotta accent as default, or partner color if available
  const accentColor = primaryColor || 'hsl(16, 65%, 50%)';

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'bg-white/95 backdrop-blur-sm',
        'border-t border-premier-sand-dark/20',
        'safe-area-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-all duration-200 touch-manipulation',
                'min-w-[60px] py-2 rounded-xl mx-0.5',
                active
                  ? 'bg-premier-accent/10'
                  : 'hover:bg-premier-sand/50'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-all duration-200',
                  active
                    ? 'scale-110'
                    : 'text-premier-ink-soft/60'
                )}
                style={active ? { color: accentColor } : undefined}
              />
              <span
                className={cn(
                  'text-[11px] mt-1 font-medium transition-colors',
                  active
                    ? 'font-semibold'
                    : 'text-premier-ink-soft/60'
                )}
                style={active ? { color: accentColor } : undefined}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
