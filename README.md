# LeadGenerator 🎯
> **B2B Lead Generation & Local SEO SaaS** — Fully serverless, zero-cost stack.

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/leadgenerator/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/leadgenerator/actions/workflows/ci-cd.yml)
[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare)](https://leadgenerator.pages.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

| Module | Capability |
|---|---|
| 🗺️ **Lead Harvester & Map** | Query OpenStreetMap Overpass API for local businesses by category & radius. Interactive Leaflet.js map with hot/warm/cold heatmap markers. |
| 🔍 **Website Intelligence Scanner** | Checks SSL, mobile viewport, Schema.org, booking widgets, WhatsApp CTAs. Scores leads 0–100 into Hot / Warm / Cold tiers. |
| 📄 **PDF Proposal Generator** | Generates branded Executive Audit PDF proposals using `pdf-lib` with deal packages and revenue leak calculations. |
| 💬 **Outreach Copy Lab** | One-click WhatsApp, Email, and LinkedIn message generation personalized to each lead's specific gaps. |
| 📋 **CRM Kanban Pipeline** | Full 6-stage Kanban board (Discovered → Contacted → Interested → Proposal Sent → Won / Lost). Confetti on deal win! |
| 📅 **Follow-up Calendar** | Schedule and track client touch-points with direct WhatsApp/Email action buttons per reminder. |
| 📊 **Export Center** | Export leads to XLSX or CSV via SheetJS, gated behind Cloudflare Turnstile bot protection. |
| 🔐 **Built-in D1 Auth** | Edge-native authentication with PBKDF2 Web Crypto password hashing, HTTP-only session cookies, and route middleware. |
| 🔒 **Security** | Cloudflare Turnstile, strict CSP headers, HTTPS enforcement, secrets scanning in CI. |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│              Cloudflare Pages (Edge)              │
│  Next.js 14 App Router · Tailwind CSS · Shadcn   │
└─────────────────────┬────────────────────────────┘
                      │ SSR / Edge Routes
┌─────────────────────▼────────────────────────────┐
│           Cloudflare Workers (Edge API)           │
│  /api/harvest · /api/scan · /api/leads · /api/   │
│               geocode                            │
└──────┬────────────────────────┬──────────────────┘
       │                        │
┌──────▼──────┐       ┌─────────▼────────┐
│ Cloudflare  │       │  External APIs   │
│    D1 DB    │       │ ─ Overpass API   │
│  (SQLite)   │       │ ─ Nominatim      │
└─────────────┘       │ ─ CF Turnstile   │
                      └──────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/leadgenerator.git
cd leadgenerator
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your Cloudflare Turnstile keys
```

### 3. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## ☁️ Cloudflare Deployment

### Prerequisites
1. [Cloudflare account](https://cloudflare.com) (free tier sufficient)
2. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed

### Step 1: Create D1 Database

```bash
npx wrangler login
npx wrangler d1 create locallead-db
# Copy the database_id and update wrangler.toml
```

### Step 2: Apply Database Migrations

```bash
# Local dev (creates .wrangler/state/v3/d1/...)
npx wrangler d1 migrations apply locallead-db --local

# Production (Cloudflare edge)
npx wrangler d1 migrations apply locallead-db --remote
```

### Step 3: Deploy to Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy .next --project-name=leadgenerator
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) runs:

```
Push to PR          →  Quality Gates (TypeScript + ESLint + Build)
Push to develop     →  Quality Gates → Deploy Staging Preview
Push to main        →  Quality Gates → Security Audit → D1 Migrations → Production Deploy
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | CF API token with "Cloudflare Pages: Edit" permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `D1_DATABASE_ID` | Your D1 database ID from `wrangler d1 create` |

---

## 📁 Project Structure

```
leadgenerator/
├── .github/
│   ├── workflows/
│   │   ├── ci-cd.yml          # Main CI/CD: lint → build → deploy
│   │   └── lighthouse.yml     # Performance audits on deploy
│   └── lighthouse-budget.json
├── migrations/
│   └── 0001_initial_schema.sql
├── src/
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   ├── finder/page.tsx    # Lead Harvester + Map
│   │   ├── crm/page.tsx       # Kanban + Follow-ups
│   │   ├── followups/page.tsx # Calendar
│   │   ├── export/page.tsx    # Export Center
│   │   └── api/               # Edge API Routes
│   │       ├── harvest/       # Overpass lead harvesting
│   │       ├── scan/          # Website audit scanner
│   │       ├── geocode/       # Nominatim city lookup
│   │       └── leads/         # D1 CRUD
│   ├── components/
│   │   ├── layout/            # Sidebar, Topbar
│   │   ├── dashboard/         # Stats cards
│   │   ├── map/               # Leaflet.js components
│   │   ├── finder/            # Harvest panel, Lead table
│   │   ├── crm/               # Kanban board, Follow-ups
│   │   ├── scanner/           # Audit modal
│   │   ├── outreach/          # Copy lab modal
│   │   ├── proposal/          # PDF proposal modal
│   │   └── security/          # Turnstile widget
│   ├── lib/
│   │   ├── osm/               # Overpass + Nominatim helpers
│   │   ├── scanner/           # Website audit engine
│   │   ├── outreach/          # Template generator
│   │   ├── proposal/          # pdf-lib PDF builder
│   │   ├── export/            # SheetJS XLSX/CSV
│   │   └── db/                # LocalStorage store + seed
│   └── types/index.ts
├── schema.sql                 # D1 reference schema
├── wrangler.toml              # Cloudflare config
└── next.config.mjs
```

---

## 🛡️ Security

- **Cloudflare Turnstile** — All export and form endpoints require bot verification
- **CSP Headers** — Strict Content Security Policy restricting inline scripts and external origins
- **No API Keys** — All data sources (OSM, Overpass, Nominatim) are fully public and free
- **Edge Runtime** — API routes run on Cloudflare's global edge network, not Node.js servers
- **TruffleHog** — Automated secrets scanning runs on every CI run

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

*Built with ❤️ on OpenStreetMap, Cloudflare, and Next.js 14.*
