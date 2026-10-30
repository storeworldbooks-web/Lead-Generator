'use client';

import React, { useState } from 'react';
import { Lead, AuditReport } from '@/types';
import { getTierColor, formatCurrency } from '@/utils';
import { performSiteAudit } from '@/lib/scanner/audit';
import {
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Globe,
  Calendar,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface OpportunityScannerModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
  onOpenProposal: (lead: Lead) => void;
}

export default function OpportunityScannerModal({
  lead,
  onClose,
  onUpdateLead,
  onOpenOutreach,
  onOpenProposal,
}: OpportunityScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);

  if (!lead) return null;
  const audit: AuditReport = lead.auditReport || performSiteAudit(lead);
  const tierStyle = getTierColor(lead.opportunityTier);

  const handleRescan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audit) {
          const updatedLead: Lead = {
            ...lead,
            auditReport: data.audit,
            opportunityScore: data.audit.opportunityScore,
            opportunityTier: data.audit.tier,
          };
          onUpdateLead(updatedLead);
        }
      } else {
        // Fallback local scan
        const localAudit = performSiteAudit(lead);
        onUpdateLead({
          ...lead,
          auditReport: localAudit,
          opportunityScore: localAudit.opportunityScore,
          opportunityTier: localAudit.tier,
        });
      }
    } catch (e) {
      console.warn('Scan failed, using local engine', e);
      const localAudit = performSiteAudit(lead);
      onUpdateLead({
        ...lead,
        auditReport: localAudit,
        opportunityScore: localAudit.opportunityScore,
        opportunityTier: localAudit.tier,
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{lead.name}</h2>
              <p className="text-xs text-slate-400">{lead.category} • {lead.city}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRescan}
              disabled={isScanning}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Re-scan'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Opportunity Score */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Opportunity Score</span>
              <div className="flex items-baseline gap-2 my-1">
                <span className={`text-3xl font-extrabold ${tierStyle.text}`}>
                  {lead.opportunityScore}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit ${tierStyle.badge}`}
              >
                {lead.opportunityTier} TIER
              </span>
            </div>

            {/* Monthly Revenue Leak */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Est. Monthly Leak</span>
              <div className="text-2xl font-extrabold text-white my-1">
                {formatCurrency(audit.estimatedMonthlyLeakUSD)}
              </div>
              <span className="text-[10px] text-rose-400">
                Missed calls & bounced bookings
              </span>
            </div>

            {/* Target Deal Size */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Target Package Value</span>
              <div className="text-2xl font-extrabold text-indigo-400 my-1">
                {formatCurrency(lead.estimatedDealValue)}
              </div>
              <span className="text-[10px] text-slate-400">
                Avg. niche client budget
              </span>
            </div>
          </div>

          {/* Technical Diagnostics Checklist */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Technical Audit & Digital Footprint
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* SSL */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {audit.isHttps ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-slate-300">SSL Encryption</span>
                </div>
                <span className={`font-semibold ${audit.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {audit.isHttps ? 'Active HTTPS' : 'Insecure / None'}
                </span>
              </div>

              {/* Mobile Viewport */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300">Mobile Viewport</span>
                </div>
                <span className={`font-semibold ${audit.hasViewport ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {audit.hasViewport ? 'Responsive' : 'Missing'}
                </span>
              </div>

              {/* Online Booking */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">24/7 Booking Portal</span>
                </div>
                <span className={`font-semibold ${audit.hasBooking ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {audit.hasBooking ? (audit.bookingProvider || 'Detected') : 'Missing'}
                </span>
              </div>

              {/* WhatsApp CTA */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">WhatsApp 1-Click CTA</span>
                </div>
                <span className={`font-semibold ${audit.hasWhatsApp ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {audit.hasWhatsApp ? 'Configured' : 'Missing'}
                </span>
              </div>

              {/* Local SEO Schema */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">Schema.org JSON-LD</span>
                </div>
                <span className={`font-semibold ${audit.hasSchema ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {audit.hasSchema ? 'Indexed' : 'Missing'}
                </span>
              </div>

              {/* Detected CMS */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">CMS / Stack</span>
                <span className="font-semibold text-slate-300">{audit.detectedCms || 'Custom'}</span>
              </div>
            </div>
          </div>

          {/* Identified Vulnerabilities & Issues */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Identified Revenue Bottlenecks ({audit.issues.length})
            </h3>
            <div className="space-y-2">
              {audit.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs"
                >
                  <AlertTriangle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      issue.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{issue.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        -{issue.impactScore} pts
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1 leading-relaxed">{issue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Pitch Strategy */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Recommended Pitch & Solution Roadmap
            </h3>
            <div className="space-y-1.5">
              {audit.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-rose-400 font-semibold">Ready for new site pitch</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenOutreach(lead);
              }}
              className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Draft Outreach</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenProposal(lead);
              }}
              className="py-2 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate PDF Proposal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
