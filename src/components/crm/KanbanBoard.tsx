'use client';

import React from 'react';
import { Lead, PipelineStage } from '@/types';
import { getTierColor, formatCurrency } from '@/utils';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Calendar,
  Phone,
  ExternalLink,
  ShieldAlert,
  Trophy,
} from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateStage: (leadId: string, stage: PipelineStage) => void;
  onOpenAudit: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
  onOpenProposal: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
}

const STAGES: { id: PipelineStage; label: string; color: string; desc: string }[] = [
  { id: 'DISCOVERED', label: 'Discovered', color: 'border-slate-700 bg-slate-900/60', desc: 'Harvested from OSM' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-blue-500/40 bg-blue-950/20', desc: 'Outreach initiated' },
  { id: 'INTERESTED', label: 'Interested', color: 'border-amber-500/40 bg-amber-950/20', desc: 'Discovery dialog' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'border-indigo-500/40 bg-indigo-950/20', desc: 'Growth PDF delivered' },
  { id: 'WON', label: 'Won Deal', color: 'border-emerald-500/40 bg-emerald-950/20', desc: 'Contract closed' },
  { id: 'LOST', label: 'Lost / Closed', color: 'border-rose-500/30 bg-rose-950/15', desc: 'Archived / Passed' },
];

export default function KanbanBoard({
  leads,
  onUpdateStage,
  onOpenAudit,
  onOpenOutreach,
  onOpenProposal,
  onScheduleFollowUp,
}: KanbanBoardProps) {
  const getStageLeads = (stage: PipelineStage) => leads.filter((l) => l.pipelineStage === stage);

  const handleMoveStage = (leadId: string, currentStage: PipelineStage, direction: 'prev' | 'next') => {
    const stageIds: PipelineStage[] = ['DISCOVERED', 'CONTACTED', 'INTERESTED', 'PROPOSAL_SENT', 'WON'];
    const currentIdx = stageIds.indexOf(currentStage);

    if (direction === 'next') {
      const nextStage = stageIds[currentIdx + 1];
      if (nextStage) {
        onUpdateStage(leadId, nextStage);
        if (nextStage === 'WON') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } else {
      const prevStage = stageIds[currentIdx - 1];
      if (prevStage) {
        onUpdateStage(leadId, prevStage);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {STAGES.map((col) => {
          const colLeads = getStageLeads(col.id);
          const colTotalValue = colLeads.reduce((acc, l) => acc + (l.estimatedDealValue || 1500), 0);

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border ${col.color} backdrop-blur-sm p-3 min-h-[600px] shadow-lg`}
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-800/80 mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {col.id === 'WON' && <Trophy className="w-3.5 h-3.5 text-emerald-400" />}
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatCurrency(colTotalValue)}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {colLeads.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-[11px] text-slate-500">
                    No leads in this stage
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const tier = getTierColor(lead.opportunityTier);

                    return (
                      <div
                        key={lead.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-3 shadow-md hover:shadow-xl transition flex flex-col justify-between group"
                      >
                        {/* Card Top */}
                        <div>
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${tier.badge}`}
                            >
                              {lead.opportunityTier} ({lead.opportunityScore})
                            </span>
                            <span className="text-xs font-semibold text-indigo-400">
                              {formatCurrency(lead.estimatedDealValue)}
                            </span>
                          </div>

                          <h4 className="font-semibold text-xs text-white line-clamp-1 mb-1">{lead.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate mb-2">{lead.category}</p>

                          {/* Quick Info Tags */}
                          <div className="text-[10px] space-y-1 mb-2 bg-slate-950/70 p-2 rounded border border-slate-800/80">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Web:</span>
                              {lead.website ? (
                                <span className="text-slate-300 truncate max-w-[100px]">Online</span>
                              ) : (
                                <span className="text-rose-400 font-bold">NO WEBSITE</span>
                              )}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center justify-between text-slate-400">
                                <span>Phone:</span>
                                <span className="text-slate-300 truncate">{lead.phone}</span>
                              </div>
                            )}
                            {lead.followUpDate && (
                              <div className="flex items-center justify-between text-indigo-400 font-medium">
                                <span>Follow-up:</span>
                                <span>{lead.followUpDate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                          {/* Quick Tool Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onOpenAudit(lead)}
                              title="Audit"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                            </button>
                            <button
                              onClick={() => onOpenOutreach(lead)}
                              title="Outreach"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-400" />
                            </button>
                            <button
                              onClick={() => onOpenProposal(lead)}
                              title="PDF Proposal"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            >
                              <FileText className="w-3 h-3 text-amber-400" />
                            </button>
                            <button
                              onClick={() => onScheduleFollowUp(lead)}
                              title="Schedule Follow-up"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            >
                              <Calendar className="w-3 h-3 text-blue-400" />
                            </button>
                          </div>

                          {/* Move Prev/Next */}
                          <div className="flex items-center gap-0.5">
                            {col.id !== 'DISCOVERED' && (
                              <button
                                onClick={() => handleMoveStage(lead.id, lead.pipelineStage, 'prev')}
                                title="Move Previous Stage"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id !== 'WON' && col.id !== 'LOST' && (
                              <button
                                onClick={() => handleMoveStage(lead.id, lead.pipelineStage, 'next')}
                                title="Move Next Stage"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
