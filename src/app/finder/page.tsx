'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AppFooter from '@/components/layout/AppFooter';
import LeadHarvestPanel from '@/components/finder/LeadHarvestPanel';
import LeadTable from '@/components/finder/LeadTable';
import LeadMap from '@/components/map/LeadMap';
import OpportunityScannerModal from '@/components/scanner/OpportunityScannerModal';
import OutreachModal from '@/components/outreach/OutreachModal';
import ProposalModal from '@/components/proposal/ProposalModal';
import { dbStore } from '@/lib/db/store';
import { Lead, PipelineStage } from '@/types';
import { harvestOverpassLeads } from '@/lib/osm/overpass';
import { performSiteAudit } from '@/lib/scanner/audit';
import { exportLeadsToExcel } from '@/lib/export/sheets';
import { useAuth } from '@/lib/auth/AuthContext';
import { getPlanDetails } from '@/lib/plans';
import { Loader2, MapPin, List, LayoutGrid } from 'lucide-react';

type ViewMode = 'split' | 'map' | 'table';
type FilterMode = 'ALL' | 'HOT' | 'NO_WEBSITE';

export default function FinderPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [lastHarvestCity, setLastHarvestCity] = useState('Austin');
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.2672, -97.7431]);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapRadius, setMapRadius] = useState(5);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [harvestError, setHarvestError] = useState<string | null>(null);
  const { user } = useAuth();
  const planDetails = user ? getPlanDetails(user.plan) : null;
  const quotaUsed = user?.harvestsUsedThisMonth ?? 0;
  const quotaLimit = planDetails?.harvestLimitMonthly ?? 50;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  // Modal states
  const [auditLead, setAuditLead] = useState<Lead | null>(null);
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);
  const [proposalLead, setProposalLead] = useState<Lead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>();

  useEffect(() => {
    const refresh = () => setLeads(dbStore.getLeads());
    refresh();
    return dbStore.subscribe(refresh);
  }, []);

  const filteredLeads = useMemo(() => {
    if (filterMode === 'HOT') return leads.filter((l) => l.opportunityTier === 'HOT');
    if (filterMode === 'NO_WEBSITE') return leads.filter((l) => !l.website);
    return leads;
  }, [leads, filterMode]);

  const handleHarvest = useCallback(
    async (params: { city: string; lat: number; lon: number; radiusKm: number; category: string }) => {
      setIsHarvesting(true);
      setLastHarvestCity(params.city);
      setMapCenter([params.lat, params.lon]);
      setMapZoom(12);
      setMapRadius(params.radiusKm);

      try {
        const harvested = await harvestOverpassLeads(params);

        // Auto-scan for audit scores
        const withAudits: Lead[] = harvested.map((lead) => ({
          ...lead,
          auditReport: performSiteAudit(lead),
        }));

        const addedCount = dbStore.bulkAddLeads(withAudits);
      } catch (err) {
        console.error('Harvest failed:', err);
      } finally {
        setIsHarvesting(false);
      }
    },
    []
  );

  const handleImportLeads = useCallback((partialLeads: Partial<Lead>[]) => {
    const fullLeads: Lead[] = partialLeads.map((pl) => ({
      id: pl.id!,
      name: pl.name!,
      category: pl.category!,
      city: pl.city!,
      address: pl.address || '',
      lat: pl.lat || 30.2672,
      lon: pl.lon || -97.7431,
      phone: pl.phone,
      email: pl.email,
      website: pl.website,
      opportunityScore: pl.opportunityScore || 50,
      opportunityTier: pl.opportunityTier || 'WARM',
      pipelineStage: pl.pipelineStage || 'DISCOVERED',
      estimatedDealValue: pl.estimatedDealValue || 1800,
      createdAt: pl.createdAt || new Date().toISOString(),
      updatedAt: pl.updatedAt || new Date().toISOString(),
    }));

    const withAudits = fullLeads.map((lead) => ({
      ...lead,
      auditReport: performSiteAudit(lead),
    }));

    dbStore.bulkAddLeads(withAudits);
  }, []);

  const handleUpdateStage = useCallback((leadId: string, stage: PipelineStage) => {
    dbStore.updatePipelineStage(leadId, stage);
  }, []);

  const handleDeleteLead = useCallback((leadId: string) => {
    if (confirm('Remove this lead from the database?')) {
      dbStore.deleteLead(leadId);
    }
  }, []);

  const handleUpdateLead = useCallback((updated: Lead) => {
    dbStore.updateLead(updated);
    if (auditLead?.id === updated.id) setAuditLead(updated);
  }, [auditLead]);

  const handleExport = useCallback(() => {
    exportLeadsToExcel(leads);
  }, [leads]);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-60">
        <Topbar
          pageTitle="Lead Harvester & Opportunity Map"
          pageSubtitle={`${leads.length} leads indexed • OpenStreetMap + Overpass API`}
          onExport={handleExport}
        />

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'split'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Map Only</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'table'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3 h-3" />
                <span>Table Only</span>
              </button>
            </div>

            {/* Quota Usage Indicator */}
            {user && planDetails && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <span className="text-slate-400">Monthly Quota:</span>
                    <span className={quotaPercent >= 90 ? 'text-rose-400 font-bold' : quotaPercent >= 70 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        quotaPercent >= 90 ? 'bg-rose-500' : quotaPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>
                </div>
                {quotaPercent >= 100 ? (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 text-orange-300 text-[11px] font-bold hover:from-orange-500/30 transition"
                  >
                    <span>⚡ Upgrade Plan</span>
                  </Link>
                ) : null}
              </div>
            )}

            {isHarvesting && (
              <div className="flex items-center gap-2 text-orange-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Querying Overpass API for {lastHarvestCity}...</span>
              </div>
            )}
          </div>

          {/* Main Layout */}
          <div className={`gap-4 ${viewMode === 'split' ? 'grid grid-cols-1 xl:grid-cols-5' : 'flex'}`}>
            {/* Harvest Panel — always visible in split / table */}
            {viewMode !== 'map' && (
              <div className="xl:col-span-2 space-y-4">
                <LeadHarvestPanel
                  onSearch={handleHarvest}
                  onImportLeads={handleImportLeads}
                  isLoading={isHarvesting}
                  activeFilter={filterMode}
                  onFilterChange={setFilterMode}
                  leadsCount={filteredLeads.length}
                />
              </div>
            )}

            {/* Map + Table column */}
            <div className={`${viewMode === 'split' ? 'xl:col-span-3' : 'flex-1'} space-y-4`}>
              {/* Interactive Leaflet Map */}
              {(viewMode === 'split' || viewMode === 'map') && (
                <div className="h-[420px] lg:h-[500px]">
                  <LeadMap
                    leads={filteredLeads}
                    center={mapCenter}
                    zoom={mapZoom}
                    radiusKm={mapRadius}
                    selectedLeadId={selectedLeadId}
                    onSelectLead={(l) => setSelectedLeadId(l.id)}
                    onOpenAudit={setAuditLead}
                    onOpenOutreach={setOutreachLead}
                  />
                </div>
              )}

              {/* Leads Data Table */}
              {(viewMode === 'split' || viewMode === 'table') && (
                <LeadTable
                  leads={filteredLeads}
                  onOpenAudit={setAuditLead}
                  onOpenOutreach={setOutreachLead}
                  onOpenProposal={setProposalLead}
                  onUpdateStage={handleUpdateStage}
                  onDeleteLead={handleDeleteLead}
                  onSelectLead={(l) => setSelectedLeadId(l.id)}
                  selectedLeadId={selectedLeadId}
                />
              )}
            </div>
          </div>

          <AppFooter />
        </main>
      </div>

      {/* Modals */}
      {auditLead && (
        <OpportunityScannerModal
          lead={auditLead}
          onClose={() => setAuditLead(null)}
          onUpdateLead={handleUpdateLead}
          onOpenOutreach={(l) => {
            setAuditLead(null);
            setOutreachLead(l);
          }}
          onOpenProposal={(l) => {
            setAuditLead(null);
            setProposalLead(l);
          }}
        />
      )}

      {outreachLead && (
        <OutreachModal
          lead={outreachLead}
          onClose={() => setOutreachLead(null)}
          onMarkContacted={(id) => handleUpdateStage(id, 'CONTACTED')}
        />
      )}

      {proposalLead && (
        <ProposalModal
          lead={proposalLead}
          onClose={() => setProposalLead(null)}
          onProposalGenerated={(id) => handleUpdateStage(id, 'PROPOSAL_SENT')}
        />
      )}
    </div>
  );
}
