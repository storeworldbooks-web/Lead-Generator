'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MapPin,
  Kanban,
  Calendar,
  Download,
  Settings,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import GrowthMachineBadge from './GrowthMachineBadge';

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeColor?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Command Dashboard',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'finder',
    label: 'Lead Harvester & Map',
    shortLabel: 'Harvester',
    icon: MapPin,
    href: '/finder',
    badge: 'NEW',
    badgeColor: 'bg-indigo-600/40 text-indigo-300',
  },
  {
    id: 'crm',
    label: 'CRM Pipeline Board',
    shortLabel: 'CRM Board',
    icon: Kanban,
    href: '/crm',
  },
  {
    id: 'followups',
    label: 'Follow-up Calendar',
    shortLabel: 'Follow-ups',
    icon: Calendar,
    href: '/followups',
  },
  {
    id: 'export',
    label: 'Export & Reports',
    shortLabel: 'Export',
    icon: Download,
    href: '/export',
  },
  {
    id: 'pricing',
    label: 'Subscription Plans',
    shortLabel: 'Pricing',
    icon: Sparkles,
    href: '/pricing',
    badge: 'DEAL',
    badgeColor: 'bg-amber-500/20 text-amber-300',
  },
  {
    id: 'admin',
    label: 'Admin Control Center',
    shortLabel: 'Admin Panel',
    icon: ShieldCheck,
    href: '/admin',
    badge: 'ADMIN',
    badgeColor: 'bg-rose-500/20 text-rose-300',
    adminOnly: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case 'AGENCY':
        return 'text-purple-400 bg-purple-950/40 border-purple-500/30';
      case 'PRO':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'STARTER':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <nav className="h-screen w-16 lg:w-60 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 fixed left-0 top-0 z-30 shadow-2xl">
      {/* Logo / Brand - GrowthMachine Aesthetic */}
      <div className="px-3 lg:px-4 py-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff6a13] to-[#ffaa00] flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <div className="text-sm font-bold text-white leading-tight flex items-center gap-1 font-display">
            <span>LeadGenerator</span>
            <span className="text-amber-400 text-xs">⚡</span>
          </div>
          <div className="text-[10px] text-amber-400/90 truncate font-medium">B2B Opportunity Engine</div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-2 lg:px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-200'
                )}
              />
              <span className="hidden lg:block flex-1">{item.shortLabel}</span>
              {item.badge && (
                <span className={cn('hidden lg:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full', item.badgeColor)}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="hidden lg:block w-3 h-3 text-orange-400" />}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile & Status */}
      <div className="px-2 lg:px-3 py-3 border-t border-slate-800/80">
        {user && (
          <div className="mb-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#ff6a13] to-[#ffaa00] flex items-center justify-center shrink-0 text-white font-bold text-xs shadow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <span className={cn('text-[9px] font-extrabold px-1.5 py-0.2 rounded border', getPlanColor(user.plan))}>
                    {user.plan || 'FREE'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Left GrowthMachine Studio Promotion */}
        <div className="hidden lg:flex flex-col items-center gap-1.5 mt-2">
          <GrowthMachineBadge size="sm" className="w-full justify-center" />
        </div>
        <div className="flex lg:hidden justify-center mt-2">
          <a
            href="https://www.growthmachinestudio.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Designed by GrowthMachine Studio"
            className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 flex items-center justify-center text-amber-400 text-xs shadow-md transition"
          >
            ⚡
          </a>
        </div>
      </div>
    </nav>
  );
}
