'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AppFooter from '@/components/layout/AppFooter';
import FollowUpScheduler from '@/components/crm/FollowUpScheduler';
import { dbStore } from '@/lib/db/store';
import { Lead, FollowUpItem } from '@/types';

export default function FollowUpsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      setLeads(dbStore.getLeads());
      setFollowUps(dbStore.getFollowUps());
    };
    refresh();
    return dbStore.subscribe(refresh);
  }, []);

  const handleAddFollowUp = useCallback((item: FollowUpItem) => {
    dbStore.addFollowUp(item);
  }, []);

  const handleToggleFollowUp = useCallback((id: string) => {
    dbStore.toggleFollowUp(id);
  }, []);

  const handleDeleteFollowUp = useCallback((id: string) => {
    dbStore.deleteFollowUp(id);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-60">
        <Topbar
          pageTitle="Follow-up Calendar & Reminders"
          pageSubtitle="Schedule and track every client touch-point for maximum outreach velocity"
        />

        <main className="flex-1 overflow-y-auto p-5">
          <FollowUpScheduler
            followUps={followUps}
            leads={leads}
            onToggleFollowUp={handleToggleFollowUp}
            onDeleteFollowUp={handleDeleteFollowUp}
            onAddFollowUp={handleAddFollowUp}
          />

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
