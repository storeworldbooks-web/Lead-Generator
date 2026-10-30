'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Lead } from '@/types';
import { MapPin, Loader2 } from 'lucide-react';

const LeafletInnerMap = dynamic(() => import('./LeafletInnerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <p className="text-sm font-medium">Initializing OpenStreetMap Leaflet Engine...</p>
    </div>
  ),
});

interface LeadMapProps {
  leads: Lead[];
  center: [number, number];
  zoom: number;
  radiusKm: number;
  selectedLeadId?: string;
  onSelectLead: (lead: Lead) => void;
  onOpenAudit: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
}

export default function LeadMap(props: LeadMapProps) {
  return (
    <div className="relative w-full h-full min-h-[450px] rounded-xl border border-slate-800 shadow-xl overflow-hidden bg-slate-950">
      <LeafletInnerMap {...props} />
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg p-2.5 text-xs text-slate-200 shadow-lg space-y-1.5 pointer-events-none">
        <div className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Lead Heatmap</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
          <span>Hot Lead (Score 70+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          <span>Warm Lead (Score 40-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span>Cold / Established</span>
        </div>
      </div>
    </div>
  );
}
