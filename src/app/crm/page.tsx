'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AppFooter from '@/components/layout/AppFooter';
import KanbanBoard from '@/components/crm/KanbanBoard';
import FollowUpScheduler from '@/components/crm/FollowUpScheduler';
import OpportunityScannerModal from '@/components/scanner/OpportunityScannerModal';
import OutreachModal from '@/components/outreach/OutreachModal';
import ProposalModal from '@/components/proposal/ProposalModal';
import { dbStore } from '@/lib/db/store';
import { Lead, PipelineStage, FollowUpItem } from '@/types';
import { exportLeadsToExcel } from '@/lib/export/sheets';
import { Kanban, Calendar } from 'lucide-react';

type TabMode = 'kanban' | 'followups';

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabMode>('kanban');

  // Modal states
  const [auditLead, setAuditLead] = useState<Lead | null>(null);
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);
  const [proposalLead, setProposalLead] = useState<Lead | null>(null);
  const [scheduleLead, setScheduleLead] = useState<Lead | null>(null);

  useEffect(() => {
    const refresh = () => {
      setLeads(dbStore.getLeads());
      setFollowUps(dbStore.getFollowUps());
    };
    refresh();
    return dbStore.subscribe(refresh);
  }, []);

  const handleUpdateStage = useCallback((leadId: string, stage: PipelineStage) => {
    dbStore.updatePipelineStage(leadId, stage);
  }, []);

  const handleUpdateLead = useCallback((updated: Lead) => {
    dbStore.updateLead(updated);
    if (auditLead?.id === updated.id) setAuditLead(updated);
  }, [auditLead]);

  const handleAddFollowUp = useCallback((item: FollowUpItem) => {
    dbStore.addFollowUp(item);
  }, []);

  const handleToggleFollowUp = useCallback((id: string) => {
    dbStore.toggleFollowUp(id);
  }, []);

  const handleDeleteFollowUp = useCallback((id: string) => {
    dbStore.deleteFollowUp(id);
  }, []);

  const handleScheduleFromModal = useCallback((lead: Lead) => {
    setScheduleLead(lead);
    setActiveTab('followups');
  }, []);

  const handleExport = useCallback(() => {
    exportLeadsToExcel(leads, 'CRM_Pipeline_Export.xlsx');
  }, [leads]);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-60">
        <Topbar
          pageTitle="CRM Pipeline Board"
          pageSubtitle="Drag leads through discovery → proposal → closed deal stages"
          onExport={handleExport}
        />

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition ${
                activeTab === 'kanban'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Pipeline</span>
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition ${
                activeTab === 'followups'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Follow-up Calendar</span>
            </button>
          </div>

          {activeTab === 'kanban' && (
            <KanbanBoard
              leads={leads}
              onUpdateStage={handleUpdateStage}
              onOpenAudit={setAuditLead}
              onOpenOutreach={setOutreachLead}
              onOpenProposal={setProposalLead}
              onScheduleFollowUp={handleScheduleFromModal}
            />
          )}

          {activeTab === 'followups' && (
            <FollowUpScheduler
              followUps={followUps}
              leads={leads}
              onToggleFollowUp={handleToggleFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
              onAddFollowUp={handleAddFollowUp}
            />
          )}

          <AppFooter />
        </main>
      </div>

      {/* Modals */}
      {auditLead && (
        <OpportunityScannerModal
          lead={auditLead}
          onClose={() => setAuditLead(null)}
          onUpdateLead={handleUpdateLead}
          onOpenOutreach={(l) => { setAuditLead(null); setOutreachLead(l); }}
          onOpenProposal={(l) => { setAuditLead(null); setProposalLead(l); }}
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
