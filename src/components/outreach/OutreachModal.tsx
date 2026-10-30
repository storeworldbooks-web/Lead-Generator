'use client';

import React, { useState } from 'react';
import { Lead } from '@/types';
import { generateOutreachCopy } from '@/lib/outreach/generator';
import {
  X,
  MessageSquare,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';

interface OutreachModalProps {
  lead: Lead | null;
  onClose: () => void;
  onMarkContacted?: (leadId: string) => void;
}

export default function OutreachModal({ lead, onClose, onMarkContacted }: OutreachModalProps) {
  const [activeTab, setActiveTab] = useState<'WHATSAPP' | 'EMAIL' | 'LINKEDIN'>('WHATSAPP');
  const [agencyName, setAgencyName] = useState('GrowthMachine Studio');
  const [senderName, setSenderName] = useState('Alex');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!lead) return null;

  const outreach = generateOutreachCopy(lead, agencyName, senderName);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLaunchAndMark = (url: string) => {
    window.open(url, '_blank');
    if (onMarkContacted && lead.pipelineStage === 'DISCOVERED') {
      onMarkContacted(lead.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Outreach & Copy Lab</h2>
              <p className="text-xs text-slate-400">Personalized multi-channel outreach for {lead.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender Info Bar */}
        <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Agency:</span>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-white text-xs w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Your Name:</span>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-white text-xs w-28"
            />
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('WHATSAPP')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'WHATSAPP'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Direct</span>
          </button>
          <button
            onClick={() => setActiveTab('EMAIL')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'EMAIL'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Cold Email Pitch</span>
          </button>
          <button
            onClick={() => setActiveTab('LINKEDIN')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'LINKEDIN'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>LinkedIn InMail</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {/* WhatsApp View */}
          {activeTab === 'WHATSAPP' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp Message Draft
                  </span>
                  <button
                    onClick={() => copyToClipboard(outreach.whatsApp.text, 'wa')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                  >
                    {copiedKey === 'wa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'wa' ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                  {outreach.whatsApp.text}
                </pre>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-400">
                  Target: {lead.phone || 'No phone recorded on OSM'}
                </span>
                <button
                  disabled={!lead.phone}
                  onClick={() => handleLaunchAndMark(outreach.whatsApp.directUrl)}
                  className="py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* Email View */}
          {activeTab === 'EMAIL' && (
            <div className="space-y-4">
              {/* Subject Lines */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-semibold text-blue-400 block mb-2">
                  A/B Tested Subject Line Variants
                </span>
                <div className="space-y-2">
                  {outreach.email.subjectVariants.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                    >
                      <span>Variant {String.fromCharCode(65 + idx)}: "{sub}"</span>
                      <button
                        onClick={() => copyToClipboard(sub, `sub-${idx}`)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedKey === `sub-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Body */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Email Body</span>
                  <button
                    onClick={() => copyToClipboard(outreach.email.body, 'email-body')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                  >
                    {copiedKey === 'email-body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'email-body' ? 'Copied Body' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                  {outreach.email.body}
                </pre>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-400">
                  Target: {lead.email || 'Email not publicly indexed'}
                </span>
                <button
                  onClick={() => handleLaunchAndMark(outreach.email.mailtoUrl)}
                  className="py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Launch Email Client</span>
                </button>
              </div>
            </div>
          )}

          {/* LinkedIn View */}
          {activeTab === 'LINKEDIN' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    Connection Request Note (&lt;300 Chars)
                  </span>
                  <button
                    onClick={() => copyToClipboard(outreach.linkedIn.connectionNote, 'li-note')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                  >
                    {copiedKey === 'li-note' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800">
                  {outreach.linkedIn.connectionNote}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    Direct InMail Pitch
                  </span>
                  <button
                    onClick={() => copyToClipboard(outreach.linkedIn.inMailMessage, 'li-inmail')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                  >
                    {copiedKey === 'li-inmail' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800">
                  {outreach.linkedIn.inMailMessage}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
