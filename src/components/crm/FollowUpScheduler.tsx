'use client';

import React, { useState } from 'react';
import { FollowUpItem, Lead } from '@/types';
import { formatDate, getWhatsAppLink, getMailtoLink } from '@/utils';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  Plus,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';

interface FollowUpSchedulerProps {
  followUps: FollowUpItem[];
  leads: Lead[];
  onToggleFollowUp: (id: string) => void;
  onDeleteFollowUp: (id: string) => void;
  onAddFollowUp: (item: FollowUpItem) => void;
}

export default function FollowUpScheduler({
  followUps,
  leads,
  onToggleFollowUp,
  onDeleteFollowUp,
  onAddFollowUp,
}: FollowUpSchedulerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00');
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL' | 'PHONE' | 'MEETING'>('WHATSAPP');
  const [note, setNote] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) return;

    const newItem: FollowUpItem = {
      id: `fu_${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      leadCategory: lead.category,
      date,
      time,
      channel,
      note: note || `Scheduled ${channel.toLowerCase()} check-in regarding website proposal.`,
      completed: false,
    };

    onAddFollowUp(newItem);
    setNote('');
    setShowAddModal(false);
  };

  const pendingFollowUps = followUps.filter((f) => !f.completed);
  const completedFollowUps = followUps.filter((f) => f.completed);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Follow-up Calendar & Pipeline Cadence</h3>
            <p className="text-xs text-slate-400">{pendingFollowUps.length} upcoming client touches scheduled</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Task</span>
        </button>
      </div>

      {/* Follow-up Items List */}
      <div className="space-y-2">
        {pendingFollowUps.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
            No active follow-ups scheduled. Click "Schedule Task" to add a reminder.
          </div>
        ) : (
          pendingFollowUps.map((item) => {
            const isOverdue = item.date < todayStr;
            const isToday = item.date === todayStr;
            const targetLead = leads.find((l) => l.id === item.leadId);

            return (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 rounded-lg p-3 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleFollowUp(item.id)}
                    className="text-slate-500 hover:text-emerald-400 transition"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-white">{item.leadName}</h4>
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>OVERDUE</span>
                        </span>
                      )}
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          TODAY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.note}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.date)} at {item.time || '10:00 AM'}</span>
                      </span>
                      <span>Channel: {item.channel}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="flex items-center gap-2">
                  {item.channel === 'WHATSAPP' && targetLead?.phone && (
                    <a
                      href={getWhatsAppLink(targetLead.phone, `Hi ${item.leadName}, following up as discussed!`)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium flex items-center gap-1 transition"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {item.channel === 'EMAIL' && targetLead?.email && (
                    <a
                      href={getMailtoLink(targetLead.email, `Following up with ${item.leadName}`, item.note)}
                      className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded text-xs font-medium flex items-center gap-1 transition"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                  )}

                  <button
                    onClick={() => onDeleteFollowUp(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Items Toggle */}
      {completedFollowUps.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium mb-1.5">
            Completed Tasks ({completedFollowUps.length})
          </div>
          <div className="space-y-1 opacity-60">
            {completedFollowUps.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="text-xs text-slate-400 flex items-center justify-between line-through py-1 px-2 rounded bg-slate-950/40"
              >
                <span>{item.leadName} - {item.note}</span>
                <button
                  onClick={() => onToggleFollowUp(item.id)}
                  className="text-xs text-indigo-400 hover:underline no-underline"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
              Schedule Follow-up Task
            </h3>

            <form onSubmit={handleCreateFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Target Lead</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="WHATSAPP">WhatsApp Direct Message</option>
                  <option value="EMAIL">Email Follow-up</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="MEETING">Video Strategy Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Follow-up Goal / Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Check if client reviewed 24/7 booking proposal..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
