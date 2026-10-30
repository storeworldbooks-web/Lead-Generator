'use client';

import React from 'react';

interface GrowthMachineBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GrowthMachineBadge({ className = '', size = 'md' }: GrowthMachineBadgeProps) {
  const isSm = size === 'sm';

  return (
    <a
      href="https://www.growthmachinestudio.com/"
      target="_blank"
      rel="noopener noreferrer"
      title="Web Design Company in Delhi | GrowthMachine Studio"
      className={`group inline-flex items-center gap-2 ${
        isSm ? 'px-2.5 py-1 text-[10px]' : 'px-4 py-1.5 text-[11px]'
      } rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 shadow-md hover:shadow-emerald-950/30 transition-all duration-200 backdrop-blur-sm ${className}`}
    >
      {/* Pulsing Neon Indicator */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      <span className="font-medium text-slate-300 group-hover:text-white transition-colors tracking-wide truncate">
        Designed by{' '}
        <span className="font-bold text-emerald-400 group-hover:text-emerald-300">
          GrowthMachine Studio
        </span>
      </span>
      <span className="text-amber-400 text-xs group-hover:scale-125 transition-transform shrink-0">⚡</span>
    </a>
  );
}
