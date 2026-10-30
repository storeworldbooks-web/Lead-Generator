'use client';

import React from 'react';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">LeadGenerator</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">B2B Local Lead Harvesting SaaS</span>
        </div>
        <div className="text-[11px] text-slate-500">
          © {currentYear} LeadGenerator. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
