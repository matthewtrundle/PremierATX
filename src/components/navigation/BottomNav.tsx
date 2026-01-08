// Bottom Navigation - Mobile Tab Bar
// Airbnb-style bottom navigation for mobile devices

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
import '@/styles/party-design-tokens.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  isAI?: boolean;
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
    { path: '/plan', label: 'AI Plan', icon: Sparkles, isAI: true },
    { path: '/my-parties', label: 'Parties', icon: CalendarDays },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '/') {
      // Home is active if we're on the root partner path
      return currentPath === getPartnerPath('/') || currentPath.endsWith('/partner/' + location.pathname.split('/partner/')[1]?.split('/')[0]);
    }
    return currentPath.includes(path);
  };

  const handleNavClick = (item: NavItem) => {
    navigate(getPartnerPath(item.path));
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'bg-white border-t border-gray-200',
        'safe-area-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors touch-manipulation',
                'min-w-[64px] py-1'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {item.isAI ? (
                // Special AI button with gradient background
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 -mt-6 rounded-full shadow-lg transition-transform',
                    active ? 'scale-110' : 'hover:scale-105'
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    active ? 'text-gray-900' : 'text-gray-400'
                  )}
                  style={active ? { color: primaryColor } : undefined}
                />
              )}
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-colors',
                  item.isAI ? 'mt-2' : '',
                  active ? 'text-gray-900' : 'text-gray-500'
                )}
                style={active && !item.isAI ? { color: primaryColor } : undefined}
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
