'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Download, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface TopbarProps {
  pageTitle: string;
  pageSubtitle?: string;
  onExport?: () => void;
}

export default function Topbar({ pageTitle, pageSubtitle, onExport }: TopbarProps) {
  const { user } = useAuth();

  const getPlanBadgeStyle = (plan?: string) => {
    switch (plan) {
      case 'AGENCY':
        return 'bg-purple-950/60 text-purple-400 border-purple-500/30';
      case 'PRO':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/30';
      case 'STARTER':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <header className="h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-5 sticky top-0 z-20 shadow-md">
      {/* Left: Title */}
      <div>
        <h1 className="text-sm font-bold text-white flex items-center gap-2">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-[11px] text-slate-400">{pageSubtitle}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Live Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live OSM Feed</span>
        </div>

        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* Pricing link */}
        <Link
          href="/pricing"
          className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30 transition"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Pricing</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50 transition"
                title="Admin Control Center"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>ADMIN</span>
              </Link>
            )}

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPlanBadgeStyle(user.plan)}`}>
              {user.plan || 'FREE'}
            </span>

            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff6a13] to-[#ffaa00] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs text-slate-300 font-medium">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
