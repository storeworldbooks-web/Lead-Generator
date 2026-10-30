'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AppFooter from '@/components/layout/AppFooter';
import TurnstileWidget from '@/components/security/TurnstileWidget';
import { dbStore } from '@/lib/db/store';
import { Lead } from '@/types';
import { exportLeadsToExcel, exportLeadsToCSV } from '@/lib/export/sheets';
import { getTierColor, formatCurrency } from '@/utils';
import {
  Download,
  FileText,
  Table,
  Filter,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Database,
  ArrowDownToLine,
} from 'lucide-react';

type ExportFilter = 'ALL' | 'HOT' | 'WARM' | 'COLD' | 'NO_WEBSITE' | 'WON';

export default function ExportPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [exportFilter, setExportFilter] = useState<ExportFilter>('ALL');
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const [lastExportType, setLastExportType] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setLeads(dbStore.getLeads());
    refresh();
    return dbStore.subscribe(refresh);
  }, []);

  const getFilteredLeads = useCallback((): Lead[] => {
    switch (exportFilter) {
      case 'HOT': return leads.filter((l) => l.opportunityTier === 'HOT');
      case 'WARM': return leads.filter((l) => l.opportunityTier === 'WARM');
      case 'COLD': return leads.filter((l) => l.opportunityTier === 'COLD');
      case 'NO_WEBSITE': return leads.filter((l) => !l.website);
      case 'WON': return leads.filter((l) => l.pipelineStage === 'WON');
      default: return leads;
    }
  }, [leads, exportFilter]);

  const handleExcelExport = useCallback(() => {
    if (!turnstileVerified) return;
    const filtered = getFilteredLeads();
    exportLeadsToExcel(filtered, `LocalLead_AI_${exportFilter}_${Date.now()}.xlsx`);
    setLastExportType('Excel (.xlsx)');
  }, [turnstileVerified, getFilteredLeads, exportFilter]);

  const handleCSVExport = useCallback(() => {
    if (!turnstileVerified) return;
    const filtered = getFilteredLeads();
    exportLeadsToCSV(filtered, `LocalLead_AI_${exportFilter}_${Date.now()}.csv`);
    setLastExportType('CSV (.csv)');
  }, [turnstileVerified, getFilteredLeads, exportFilter]);

  const handleResetDatabase = useCallback(() => {
    if (confirm('This will reset the database to the initial seed data. Continue?')) {
      dbStore.resetToSeed();
    }
  }, []);

  const filteredLeads = getFilteredLeads();
  const stats = dbStore.getStats();

  const filterOptions: { id: ExportFilter; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Leads', count: leads.length },
    { id: 'HOT', label: 'Hot Tier Only', count: leads.filter((l) => l.opportunityTier === 'HOT').length },
    { id: 'WARM', label: 'Warm Tier Only', count: leads.filter((l) => l.opportunityTier === 'WARM').length },
    { id: 'NO_WEBSITE', label: 'No Website', count: leads.filter((l) => !l.website).length },
    { id: 'WON', label: 'Won Deals', count: leads.filter((l) => l.pipelineStage === 'WON').length },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-60">
        <Topbar
          pageTitle="Export Center & Data Reports"
          pageSubtitle="Download leads in XLSX or CSV with Cloudflare Turnstile protection"
          onExport={handleExcelExport}
        />

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Database Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Leads', value: stats.totalLeads, icon: Database, color: 'text-indigo-400' },
              { label: 'Hot Leads', value: stats.hotLeads, icon: AlertTriangle, color: 'text-rose-400' },
              { label: 'Pipeline Value', value: formatCurrency(stats.pipelineValue), icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Deals Won', value: stats.wonCount, icon: Sparkles, color: 'text-yellow-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
                  <div>
                    <div className="text-sm font-bold text-white">{item.value}</div>
                    <div className="text-[11px] text-slate-400">{item.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Export Configuration Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filter Selection */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Export Filter & Segment Selection</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setExportFilter(opt.id)}
                      className={`p-3 rounded-xl text-left border transition flex flex-col gap-1 ${
                        exportFilter === opt.id
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-sm">{opt.count}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Turnstile Verification */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Cloudflare Turnstile Verification</h3>
                </div>
                <p className="text-xs text-slate-400">
                  All data exports are protected by Cloudflare Turnstile to prevent automated abuse and scraping.
                </p>
                <TurnstileWidget
                  onVerify={(token) => {
                    console.log('Turnstile token:', token);
                    setTurnstileVerified(true);
                  }}
                />
              </div>

              {/* Export Buttons */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2.5 mb-1">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Generate Export File</h3>
                </div>

                <p className="text-xs text-slate-400">
                  Exporting <span className="text-white font-semibold">{filteredLeads.length}</span> leads from
                  segment: <span className="text-indigo-300 font-semibold">{exportFilter}</span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExcelExport}
                    disabled={!turnstileVerified}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Table className="w-4 h-4" />
                    <span>Export Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={handleCSVExport}
                    disabled={!turnstileVerified}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV (.csv)</span>
                  </button>
                </div>

                {!turnstileVerified && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Complete Turnstile verification above to enable exports.
                  </p>
                )}

                {lastExportType && turnstileVerified && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Last export: {lastExportType} — {filteredLeads.length} leads downloaded.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Preview Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Preview ({filteredLeads.length} leads)</h3>
              </div>
              <div className="overflow-y-auto max-h-[500px] divide-y divide-slate-800/60 text-xs">
                {filteredLeads.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">No leads match this filter.</div>
                ) : (
                  filteredLeads.slice(0, 50).map((lead) => {
                    const tier = getTierColor(lead.opportunityTier);
                    return (
                      <div key={lead.id} className="p-3 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{lead.name}</p>
                          <p className="text-slate-400 truncate">{lead.city} • {lead.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${tier.badge}`}>
                            {lead.opportunityTier}
                          </span>
                          <p className="text-[11px] text-indigo-400 mt-0.5">{formatCurrency(lead.estimatedDealValue)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-rose-300">Reset to Seed Database</h4>
              <p className="text-[11px] text-rose-400/70 mt-0.5">Restores all leads to the initial 5 demo entries from Austin, TX.</p>
            </div>
            <button
              onClick={handleResetDatabase}
              className="py-1.5 px-3.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
          </div>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
