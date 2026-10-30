'use client';

import React, { useState } from 'react';
import { Lead, PipelineStage } from '@/types';
import { getTierColor, formatCurrency } from '@/utils';
import {
  Search,
  ExternalLink,
  Phone,
  Mail,
  ShieldAlert,
  FileText,
  MessageSquare,
  Sparkles,
  Trash2,
  CheckCircle2,
  ArrowUpDown,
  MoreVertical,
} from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  onOpenAudit: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
  onOpenProposal: (lead: Lead) => void;
  onUpdateStage: (leadId: string, stage: PipelineStage) => void;
  onDeleteLead: (leadId: string) => void;
  onSelectLead: (lead: Lead) => void;
  selectedLeadId?: string;
}

export default function LeadTable({
  leads,
  onOpenAudit,
  onOpenOutreach,
  onOpenProposal,
  onUpdateStage,
  onDeleteLead,
  onSelectLead,
  selectedLeadId,
}: LeadTableProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'value' | 'name'>('score');
  const [sortDesc, setSortDesc] = useState(true);

  const filteredLeads = leads
    .filter((l) => {
      const q = searchFilter.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return sortDesc ? b.opportunityScore - a.opportunityScore : a.opportunityScore - b.opportunityScore;
      }
      if (sortBy === 'value') {
        return sortDesc ? b.estimatedDealValue - a.estimatedDealValue : a.estimatedDealValue - b.estimatedDealValue;
      }
      return sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    });

  const toggleSort = (type: 'score' | 'value' | 'name') => {
    if (sortBy === type) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(type);
      setSortDesc(true);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search filtered leads by name, city, address..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSort('score')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
              sortBy === 'score'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Sort by Score</span>
          </button>
          <button
            onClick={() => toggleSort('value')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
              sortBy === 'value'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Deal Value</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px] sticky top-0 z-10 backdrop-blur-md">
              <th className="py-3 px-4">Business & Location</th>
              <th className="py-3 px-4">Opportunity Score</th>
              <th className="py-3 px-4">Channels & Web</th>
              <th className="py-3 px-4">Pipeline Stage</th>
              <th className="py-3 px-4">Deal Value</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No businesses found matching your criteria. Try adjusting your harvest location or filters.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const tierStyle = getTierColor(lead.opportunityTier);
                const isSelected = lead.id === selectedLeadId;

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`cursor-pointer transition hover:bg-slate-800/40 ${
                      isSelected ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    {/* Business Name & Address */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-sm leading-snug">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>{lead.category}</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{lead.city}</span>
                      </div>
                    </td>

                    {/* Opportunity Score & Tier */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${tierStyle.badge}`}
                        >
                          {lead.opportunityScore}
                        </div>
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierStyle.badge}`}
                          >
                            {lead.opportunityTier}
                          </span>
                          {lead.auditReport?.estimatedMonthlyLeakUSD ? (
                            <div className="text-[10px] text-rose-400 mt-0.5">
                              ~{formatCurrency(lead.auditReport.estimatedMonthlyLeakUSD)}/mo leak
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Channels & Website */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 text-[11px]">
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 truncate max-w-[170px]"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>NO WEBSITE</span>
                          </span>
                        )}

                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          {lead.phone && (
                            <span className="flex items-center gap-0.5 truncate">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{lead.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Pipeline Stage Switcher */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.pipelineStage}
                        onChange={(e) => onUpdateStage(lead.id, e.target.value as PipelineStage)}
                        className={`text-xs rounded-md px-2 py-1 font-medium border bg-slate-950 focus:outline-none transition ${
                          lead.pipelineStage === 'WON'
                            ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20'
                            : lead.pipelineStage === 'PROPOSAL_SENT'
                            ? 'text-indigo-400 border-indigo-500/40 bg-indigo-950/20'
                            : lead.pipelineStage === 'INTERESTED'
                            ? 'text-amber-400 border-amber-500/40 bg-amber-950/20'
                            : 'text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="DISCOVERED">Discovered</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="PROPOSAL_SENT">Proposal Sent</option>
                        <option value="WON">Won Deal</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </td>

                    {/* Estimated Deal Value */}
                    <td className="py-3 px-4 font-semibold text-white">
                      {formatCurrency(lead.estimatedDealValue)}
                    </td>

                    {/* Actions Buttons */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Deep Audit */}
                        <button
                          onClick={() => onOpenAudit(lead)}
                          title="Run Deep Website Audit"
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {/* Outreach Copy */}
                        <button
                          onClick={() => onOpenOutreach(lead)}
                          title="Generate WhatsApp/Email Outreach"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Proposal PDF */}
                        <button
                          onClick={() => onOpenProposal(lead)}
                          title="Generate PDF Proposal"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Lead */}
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          title="Delete Lead"
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
