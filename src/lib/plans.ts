import { SubscriptionPlan, SubscriptionTier } from '@/types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    tagline: 'Test local market harvesting with zero cost',
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    priceMonthlyINR: 0,
    priceYearlyINR: 0,
    harvestLimitMonthly: 50,
    features: [
      '50 Verified Leads / month',
      'OpenStreetMap Overpass Map view',
      '5 Website Opportunity Audits',
      'Basic CRM Kanban Board',
      'Standard CSV Export',
      'Community Support',
    ],
    ctaText: 'Current Plan',
  },
  {
    id: 'STARTER',
    name: 'Solopreneur',
    tagline: 'Ideal for freelance web designers & local marketers',
    priceMonthlyUSD: 15,
    priceYearlyUSD: 12, // per month billed annually ($144/yr)
    priceMonthlyINR: 1199,
    priceYearlyINR: 999,
    harvestLimitMonthly: 1000,
    features: [
      '1,000 Verified Leads / month',
      'Full Website Opportunity Scanner (SSL, Schema, Viewport, WhatsApp, Booking)',
      'Algorithmic Opportunity Scoring (Hot/Warm/Cold)',
      'Personalized WhatsApp & Email Outreach Generator',
      'Executive PDF Audit Proposals (`pdf-lib`)',
      'Full 6-Stage CRM Kanban Pipeline',
      'Follow-up Calendar & Reminders',
      'CSV & Excel (XLSX) Export via SheetJS',
    ],
    ctaText: 'Upgrade to Solopreneur',
  },
  {
    id: 'PRO',
    name: 'Pro Growth',
    tagline: 'Best for growing digital agencies & high-velocity sales',
    priceMonthlyUSD: 29,
    priceYearlyUSD: 24, // per month billed annually ($288/yr)
    priceMonthlyINR: 2299,
    priceYearlyINR: 1899,
    harvestLimitMonthly: 5000,
    isPopular: true,
    features: [
      '5,000 Verified Leads / month',
      'Up to 50 km High-Density Radius Scraping',
      'Unlimited Instant Website Intelligence Audits',
      'Full Outreach Copy Lab (WhatsApp, Email & Direct Launch)',
      'White-Label PDF Proposals (Custom Agency Branding)',
      'Cloudflare Edge Priority Caching',
      'Turnstile-Protected Instant Bulk Export',
      'Priority Email & WhatsApp Support',
    ],
    ctaText: '⚡ Claim Pro Growth',
  },
  {
    id: 'AGENCY',
    name: 'Agency Scale',
    tagline: 'Maximum volume for agency teams & enterprise outreach',
    priceMonthlyUSD: 59,
    priceYearlyUSD: 49, // per month billed annually ($588/yr)
    priceMonthlyINR: 4499,
    priceYearlyINR: 3799,
    harvestLimitMonthly: 25000,
    features: [
      '25,000 Verified Leads / month',
      'Multi-City Batch Scraping & Coordinates Targeting',
      'Unlimited White-Label Proposals & Audits',
      'Up to 5 Team Member Seats',
      'Webhooks & Custom CRM Sync',
      'Dedicated Cloudflare D1 Partitioning',
      '1-on-1 Strategy Call with GrowthMachine Studio',
      '24/7 Priority SLA & Dedicated Account Manager',
    ],
    ctaText: 'Scale to Agency',
  },
];

export function getPlanDetails(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === tier) || SUBSCRIPTION_PLANS[0];
}
