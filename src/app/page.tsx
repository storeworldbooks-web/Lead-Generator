'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AppFooter from '@/components/layout/AppFooter';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { dbStore } from '@/lib/db/store';
import { Lead, FollowUpItem } from '@/types';
import { getTierColor, formatCurrency, formatDate } from '@/utils';
import {
  MapPin,
  Kanban,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Flame,
  Clock,
  MessageSquare,
  FileText,
  Target,
  Zap,
  BarChart2,
} from 'lucide-react';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    pipelineValue: 0,
    wonCount: 0,
    totalOpportunityLeak: 0,
  });

  useEffect(() => {
    const refreshData = () => {
      setLeads(dbStore.getLeads());
      setFollowUps(dbStore.getFollowUps());
      setStats(dbStore.getStats());
    };

    refreshData();
    const unsub = dbStore.subscribe(refreshData);
    return unsub;
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const followUpsToday = followUps.filter((f) => !f.completed && f.date <= todayStr).length;

  const hotLeads = leads.filter((l) => l.opportunityTier === 'HOT').slice(0, 5);
  const pendingFollowUps = followUps.filter((f) => !f.completed).slice(0, 4);

  const pipelineStageCount = {
    DISCOVERED: leads.filter((l) => l.pipelineStage === 'DISCOVERED').length,
    CONTACTED: leads.filter((l) => l.pipelineStage === 'CONTACTED').length,
    INTERESTED: leads.filter((l) => l.pipelineStage === 'INTERESTED').length,
    PROPOSAL_SENT: leads.filter((l) => l.pipelineStage === 'PROPOSAL_SENT').length,
    WON: leads.filter((l) => l.pipelineStage === 'WON').length,
    LOST: leads.filter((l) => l.pipelineStage === 'LOST').length,
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-60">
        <Topbar
          pageTitle="Command Dashboard"
          pageSubtitle="Real-time B2B Lead Intelligence & Pipeline Monitoring"
        />

        <main className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Hero Banner - GrowthMachine Studio High-Conversion Design */}
          <div className="bg-gradient-to-r from-slate-900 via-[#181b24] to-[#12141a] rounded-2xl p-6 border border-orange-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ff6a13]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff6a13] to-[#ffaa00] shadow-lg shadow-orange-500/20 flex items-center justify-center">
                      <Zap className="w-4.5 h-4.5 text-white fill-white" />
                    </div>
                    <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                      LeadGenerator SaaS
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 font-display">
                    High-Converting B2B Lead Intelligence{' '}
                    <span className="gradient-text-orange">Command Center</span>
                  </h1>
                  <p className="text-slate-400 text-sm max-w-xl">
                    Harvest local businesses from OpenStreetMap, scan digital gaps, generate personalized outreach, and close deals.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/finder"
                    className="py-2.5 px-4 bg-gradient-to-r from-[#ff6a13] to-[#ffaa00] hover:opacity-90 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-orange-500/25"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Harvest Leads</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/crm"
                    className="py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition border border-slate-700"
                  >
                    <Kanban className="w-4 h-4" />
                    <span>View Pipeline</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <DashboardStats
            totalLeads={stats.totalLeads}
            hotLeads={stats.hotLeads}
            warmLeads={stats.warmLeads}
            pipelineValue={stats.pipelineValue}
            wonCount={stats.wonCount}
            totalOpportunityLeak={stats.totalOpportunityLeak}
            followUpsToday={followUpsToday}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Left: Hot Leads List */}
            <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Top Hot Opportunity Leads</h3>
                </div>
                <Link
                  href="/finder"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-slate-800/60">
                {hotLeads.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    No hot leads yet. Run the Lead Harvester to find opportunities.
                  </div>
                ) : (
                  hotLeads.map((lead) => {
                    const tier = getTierColor(lead.opportunityTier);
                    return (
                      <div
                        key={lead.id}
                        className="p-4 hover:bg-slate-800/40 transition flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${tier.badge}`}
                          >
                            {lead.opportunityScore}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{lead.name}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{lead.category}</span>
                              <span>•</span>
                              <span>{lead.city}</span>
                              {!lead.website && (
                                <>
                                  <span>•</span>
                                  <span className="text-rose-400 font-semibold">No Website</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-white">{formatCurrency(lead.estimatedDealValue)}</div>
                          <div className="text-xs text-rose-400">
                            {formatCurrency(lead.auditReport?.estimatedMonthlyLeakUSD || 0)}/mo leak
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Pipeline Funnel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Pipeline Funnel</h3>
                </div>
                <div className="p-4 space-y-2.5 text-xs">
                  {Object.entries(pipelineStageCount).map(([stage, count]) => {
                    const maxCount = Math.max(...Object.values(pipelineStageCount), 1);
                    const width = Math.round((count / maxCount) * 100);
                    const stageColors: Record<string, string> = {
                      DISCOVERED: 'bg-slate-600',
                      CONTACTED: 'bg-blue-600',
                      INTERESTED: 'bg-amber-500',
                      PROPOSAL_SENT: 'bg-indigo-500',
                      WON: 'bg-emerald-500',
                      LOST: 'bg-rose-700',
                    };
                    const stageLabels: Record<string, string> = {
                      DISCOVERED: 'Discovered',
                      CONTACTED: 'Contacted',
                      INTERESTED: 'Interested',
                      PROPOSAL_SENT: 'Proposal Sent',
                      WON: 'Won',
                      LOST: 'Lost',
                    };

                    return (
                      <div key={stage}>
                        <div className="flex items-center justify-between mb-1 text-slate-300">
                          <span>{stageLabels[stage]}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stageColors[stage]} transition-all`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Follow-ups */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Upcoming Follow-ups</h3>
                  </div>
                  <Link href="/followups" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-800/50">
                  {pendingFollowUps.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      All clear! No upcoming follow-ups.
                    </div>
                  ) : (
                    pendingFollowUps.map((fu) => (
                      <div key={fu.id} className="p-3.5 flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{fu.leadName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{fu.note}</p>
                          <p className="text-[10px] text-blue-400 mt-0.5">{formatDate(fu.date)} • {fu.channel}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Quick Actions</h3>
                <Link
                  href="/finder"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-xs text-indigo-300 font-medium transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Harvest New Leads from OSM</span>
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
                <Link
                  href="/crm"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 font-medium transition"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Update CRM Pipeline Board</span>
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
                <Link
                  href="/export"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 font-medium transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Leads to CSV / XLSX</span>
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
              </div>
            </div>
          </div>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
