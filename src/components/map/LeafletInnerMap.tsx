'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Lead } from '@/types';
import { getTierColor } from '@/utils';

interface LeafletInnerMapProps {
  leads: Lead[];
  center: [number, number];
  zoom: number;
  radiusKm: number;
  selectedLeadId?: string;
  onSelectLead: (lead: Lead) => void;
  onOpenAudit: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
}

export default function LeafletInnerMap({
  leads,
  center,
  zoom,
  radiusKm,
  selectedLeadId,
  onSelectLead,
  onOpenAudit,
  onOpenOutreach,
}: LeafletInnerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High performance CartoDB Dark Matter / Positron or OSM standard
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Center & Radius circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom);

    if (circleLayerRef.current) {
      circleLayerRef.current.remove();
    }

    circleLayerRef.current = L.circle(center, {
      radius: radiusKm * 1000,
      color: '#4F46E5',
      fillColor: '#6366F1',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 6',
    }).addTo(mapInstanceRef.current);
  }, [center, zoom, radiusKm]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    leads.forEach((lead) => {
      if (!lead.lat || !lead.lon) return;

      const isHot = lead.opportunityTier === 'HOT';
      const isWarm = lead.opportunityTier === 'WARM';
      const isSelected = lead.id === selectedLeadId;

      const markerColor = isHot ? '#F43F5E' : isWarm ? '#F59E0B' : '#10B981';
      const pulseHtml = isHot ? `<span class="absolute -inset-1 rounded-full bg-rose-500 animate-ping opacity-30"></span>` : '';

      const customIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transform transition-transform hover:scale-125 ${isSelected ? 'scale-125 z-50' : ''}">
            ${pulseHtml}
            <div style="background-color: ${markerColor};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              ${lead.opportunityScore}
            </div>
            <div style="border-top-color: ${markerColor};" class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] absolute -bottom-1"></div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([lead.lat, lead.lon], { icon: customIcon });

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 text-slate-800 min-w-[220px] font-sans';
      popupDiv.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isHot ? 'bg-rose-100 text-rose-700' : isWarm ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
            ${lead.opportunityTier} TIER (${lead.opportunityScore}/100)
          </span>
          <span class="text-xs font-semibold text-indigo-600">$${lead.estimatedDealValue}</span>
        </div>
        <h4 class="font-bold text-sm text-slate-900 leading-tight mb-1">${lead.name}</h4>
        <p class="text-xs text-slate-500 mb-2 truncate">${lead.address}</p>
        <div class="text-[11px] space-y-1 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Website:</span>
            <span class="font-medium ${lead.website ? 'text-slate-700' : 'text-rose-600 font-bold'}">${lead.website ? 'Online' : 'NO WEBSITE'}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Phone:</span>
            <span class="font-medium text-slate-700">${lead.phone || 'N/A'}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="btn-audit-${lead.id}" class="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold text-center transition">
            Deep Audit
          </button>
          <button id="btn-outreach-${lead.id}" class="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold text-center transition">
            Outreach
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectLead(lead);
      });

      marker.on('popupopen', () => {
        const auditBtn = document.getElementById(`btn-audit-${lead.id}`);
        const outreachBtn = document.getElementById(`btn-outreach-${lead.id}`);

        auditBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          onOpenAudit(lead);
        });

        outreachBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          onOpenOutreach(lead);
        });
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [leads, selectedLeadId, onSelectLead, onOpenAudit, onOpenOutreach]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[450px] rounded-xl overflow-hidden relative z-0" />;
}
