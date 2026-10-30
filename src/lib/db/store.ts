'use client';

import { Lead, PipelineStage, FollowUpItem } from '@/types';
import { INITIAL_SEED_LEADS } from './seed';

const STORAGE_KEY_LEADS = 'locallead_leads_v1';
const STORAGE_KEY_FOLLOWUPS = 'locallead_followups_v1';

class LocalLeadStore {
  private leads: Lead[] = [];
  private followUps: FollowUpItem[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.initialized) return;
    try {
      const storedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
      if (storedLeads) {
        this.leads = JSON.parse(storedLeads);
      } else {
        this.leads = [...INITIAL_SEED_LEADS];
        this.persistLeads();
      }

      const storedFollowUps = localStorage.getItem(STORAGE_KEY_FOLLOWUPS);
      if (storedFollowUps) {
        this.followUps = JSON.parse(storedFollowUps);
      } else {
        this.generateDefaultFollowUps();
        this.persistFollowUps();
      }
    } catch (e) {
      console.warn('Failed reading from localStorage, using initial seed', e);
      this.leads = [...INITIAL_SEED_LEADS];
    }
    this.initialized = true;
  }

  private generateDefaultFollowUps() {
    this.followUps = [
      {
        id: 'fu-1',
        leadId: 'lead-seed-2',
        leadName: 'Lone Star Elite Roofing & Gutters',
        leadCategory: 'Roofing & Exterior Contractors',
        date: '2026-10-31',
        time: '14:00',
        channel: 'WHATSAPP',
        note: 'Follow up on 3-page growth PDF proposal and estimate calculator.',
        completed: false,
      },
      {
        id: 'fu-2',
        leadId: 'lead-seed-1',
        leadName: 'South Congress Dental Care',
        leadCategory: 'Dentists & Dental Clinics',
        date: '2026-11-02',
        time: '11:30',
        channel: 'EMAIL',
        note: 'Zoom strategy review for 24/7 patient booking system.',
        completed: false,
      },
      {
        id: 'fu-3',
        leadId: 'lead-seed-3',
        leadName: 'Barton Springs Artisan Cafe & Bakery',
        leadCategory: 'Restaurants, Cafes & Bakeries',
        date: '2026-11-04',
        time: '16:00',
        channel: 'WHATSAPP',
        note: 'Send catering order workflow demo video.',
        completed: false,
      },
    ];
  }

  private persistLeads() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(this.leads));
    }
  }

  private persistFollowUps() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_FOLLOWUPS, JSON.stringify(this.followUps));
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getLeads(): Lead[] {
    if (!this.initialized && typeof window !== 'undefined') this.init();
    return [...this.leads];
  }

  public getLead(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  public addLead(lead: Lead) {
    // Avoid duplicate OSM IDs
    if (lead.osmId && this.leads.some((l) => l.osmId === lead.osmId)) {
      return;
    }
    this.leads.unshift(lead);
    this.persistLeads();
    this.notify();
  }

  public bulkAddLeads(newLeads: Lead[]): number {
    let addedCount = 0;
    for (const lead of newLeads) {
      if (!this.leads.some((l) => l.id === lead.id || (lead.osmId && l.osmId === lead.osmId))) {
        this.leads.unshift(lead);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      this.persistLeads();
      this.notify();
    }
    return addedCount;
  }

  public updateLead(updated: Lead) {
    const idx = this.leads.findIndex((l) => l.id === updated.id);
    if (idx !== -1) {
      this.leads[idx] = { ...updated, updatedAt: new Date().toISOString() };
      this.persistLeads();
      this.notify();
    }
  }

  public updatePipelineStage(leadId: string, stage: PipelineStage) {
    const lead = this.leads.find((l) => l.id === leadId);
    if (lead) {
      lead.pipelineStage = stage;
      lead.updatedAt = new Date().toISOString();
      this.persistLeads();
      this.notify();
    }
  }

  public deleteLead(leadId: string) {
    this.leads = this.leads.filter((l) => l.id !== leadId);
    this.followUps = this.followUps.filter((f) => f.leadId !== leadId);
    this.persistLeads();
    this.persistFollowUps();
    this.notify();
  }

  public getFollowUps(): FollowUpItem[] {
    if (!this.initialized && typeof window !== 'undefined') this.init();
    return [...this.followUps];
  }

  public addFollowUp(item: FollowUpItem) {
    this.followUps.push(item);
    this.persistFollowUps();
    this.notify();
  }

  public toggleFollowUp(id: string) {
    const item = this.followUps.find((f) => f.id === id);
    if (item) {
      item.completed = !item.completed;
      this.persistFollowUps();
      this.notify();
    }
  }

  public deleteFollowUp(id: string) {
    this.followUps = this.followUps.filter((f) => f.id !== id);
    this.persistFollowUps();
    this.notify();
  }

  public resetToSeed() {
    this.leads = [...INITIAL_SEED_LEADS];
    this.generateDefaultFollowUps();
    this.persistLeads();
    this.persistFollowUps();
    this.notify();
  }

  public getStats() {
    const leads = this.getLeads();
    const totalLeads = leads.length;
    const hotLeads = leads.filter((l) => l.opportunityTier === 'HOT').length;
    const warmLeads = leads.filter((l) => l.opportunityTier === 'WARM').length;
    const pipelineValue = leads
      .filter((l) => l.pipelineStage !== 'LOST')
      .reduce((acc, l) => acc + (l.estimatedDealValue || 1500), 0);
    const wonCount = leads.filter((l) => l.pipelineStage === 'WON').length;
    const totalOpportunityLeak = leads.reduce((acc, l) => acc + (l.auditReport?.estimatedMonthlyLeakUSD || 0), 0);

    return {
      totalLeads,
      hotLeads,
      warmLeads,
      pipelineValue,
      wonCount,
      totalOpportunityLeak,
    };
  }
}

export const dbStore = new LocalLeadStore();
