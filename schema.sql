-- LocalLead AI - Cloudflare D1 Database Schema
-- Run via: wrangler d1 execute locallead-db --file=./schema.sql

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    osm_id TEXT UNIQUE,
    osm_type TEXT,
    opening_hours TEXT,
    opportunity_score INTEGER DEFAULT 0,
    opportunity_tier TEXT DEFAULT 'COLD', -- 'HOT', 'WARM', 'COLD'
    pipeline_stage TEXT DEFAULT 'DISCOVERED', -- 'DISCOVERED', 'CONTACTED', 'INTERESTED', 'PROPOSAL_SENT', 'WON', 'LOST'
    estimated_deal_value INTEGER DEFAULT 1500,
    follow_up_date TEXT,
    follow_up_note TEXT,
    notes TEXT,
    tags TEXT, -- JSON array of tags
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Website Audit Reports Table
CREATE TABLE IF NOT EXISTS audit_reports (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    scanned_at TEXT DEFAULT (datetime('now')),
    status TEXT NOT NULL, -- 'SUCCESS', 'FAILED', 'NO_WEBSITE'
    status_code INTEGER,
    url TEXT,
    is_https INTEGER DEFAULT 0,
    has_valid_ssl INTEGER DEFAULT 0,
    has_viewport INTEGER DEFAULT 0,
    title TEXT,
    title_length INTEGER,
    meta_description TEXT,
    meta_description_length INTEGER,
    has_schema INTEGER DEFAULT 0,
    has_booking INTEGER DEFAULT 0,
    booking_provider TEXT,
    has_whatsapp INTEGER DEFAULT 0,
    has_phone INTEGER DEFAULT 0,
    has_email INTEGER DEFAULT 0,
    detected_cms TEXT,
    social_links TEXT, -- JSON object
    issues TEXT, -- JSON array of AuditIssue objects
    recommendations TEXT, -- JSON array of string recommendations
    opportunity_score INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'COLD',
    estimated_monthly_leak_usd INTEGER DEFAULT 0,
    FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- CRM Follow-up Reminders Table
CREATE TABLE IF NOT EXISTS followups (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    channel TEXT DEFAULT 'EMAIL', -- 'WHATSAPP', 'EMAIL', 'PHONE', 'MEETING'
    note TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Outreach History Logs Table
CREATE TABLE IF NOT EXISTS outreach_logs (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    sent_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'SENT',
    FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Application Settings / User Preferences Table
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(opportunity_tier);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_followups_date ON followups(date, completed);
CREATE INDEX IF NOT EXISTS idx_audit_lead ON audit_reports(lead_id);
