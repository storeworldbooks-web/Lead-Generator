'use client';

import React, { useState } from 'react';
import { Lead } from '@/types';
import { generateProposalPDF, downloadProposalPDF } from '@/lib/proposal/pdf';
import { formatCurrency } from '@/utils';
import {
  X,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  Sparkles,
  Building,
  TrendingUp,
} from 'lucide-react';

interface ProposalModalProps {
  lead: Lead | null;
  onClose: () => void;
  onProposalGenerated?: (leadId: string) => void;
}

export default function ProposalModal({ lead, onClose, onProposalGenerated }: ProposalModalProps) {
  const [agencyName, setAgencyName] = useState('GrowthMachine Studio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!lead) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await generateProposalPDF(lead, agencyName);
      downloadProposalPDF(pdfBytes, lead.name);
      setDownloadSuccess(true);
      if (onProposalGenerated) {
        onProposalGenerated(lead.id);
      }
    } catch (err) {
      console.error('Failed generating PDF:', err);
      alert('Error generating PDF proposal.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate Client Proposal PDF</h2>
              <p className="text-xs text-slate-400">Executive Local SEO & Web Audit Proposal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Settings */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Business Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">{lead.name}</span>
              <span className="text-xs font-semibold text-indigo-400">
                Score: {lead.opportunityScore}/100
              </span>
            </div>
            <p className="text-slate-400">{lead.category} in {lead.city}</p>
            <div className="text-[11px] text-slate-500">
              Est. Monthly Revenue Leak: <span className="text-rose-400 font-semibold">{formatCurrency(lead.auditReport?.estimatedMonthlyLeakUSD || 1800)}/mo</span>
            </div>
          </div>

          {/* Agency Config */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Your Agency / Business Name on Report</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Included Sections Preview */}
          <div className="space-y-1.5 pt-1">
            <span className="font-semibold text-slate-300 block mb-1">Generated Sections in PDF:</span>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Executive Summary & Digital Opportunity Scorecard</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Technical Diagnostics Checklist (SSL, Mobile, Schema, 24/7 Booking)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>3-Tier Implementation Packages ($650 - $3,200)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>High-Converting Call to Action & Sign-off Block</span>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Proposal downloaded successfully! Lead pipeline stage updated to "Proposal Sent".</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Close
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling Vector PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Proposal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
