export type OpportunityTier = 'HOT' | 'WARM' | 'COLD';

export type PipelineStage = 
  | 'DISCOVERED' 
  | 'CONTACTED' 
  | 'INTERESTED' 
  | 'PROPOSAL_SENT' 
  | 'WON' 
  | 'LOST';

export interface AuditIssue {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  category: 'SEO' | 'MOBILE' | 'SECURITY' | 'CONVERSION' | 'PERFORMANCE';
  impactScore: number; // 5-25 points deducted from health
}

export interface AuditReport {
  scannedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'NO_WEBSITE';
  statusCode?: number;
  url?: string;
  isHttps: boolean;
  hasValidSsl: boolean;
  hasViewport: boolean;
  title?: string;
  titleLength?: number;
  metaDescription?: string;
  metaDescriptionLength?: number;
  hasSchema: boolean;
  hasBooking: boolean;
  bookingProvider?: string;
  hasWhatsApp: boolean;
  whatsAppNumber?: string;
  hasPhone: boolean;
  hasEmail: boolean;
  detectedCms?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    googleMaps?: string;
  };
  issues: AuditIssue[];
  recommendations: string[];
  opportunityScore: number; // 0-100 (100 = Huge opportunity to pitch)
  tier: OpportunityTier;
  estimatedMonthlyLeakUSD: number;
}

export interface Lead {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat: number;
  lon: number;
  phone?: string;
  email?: string;
  website?: string;
  osmId?: string;
  osmType?: 'node' | 'way' | 'relation';
  openingHours?: string;
  rating?: number;
  reviewsCount?: number;
  opportunityScore: number; // 0-100
  opportunityTier: OpportunityTier;
  auditReport?: AuditReport;
  pipelineStage: PipelineStage;
  followUpDate?: string; // YYYY-MM-DD
  followUpNote?: string;
  notes?: string;
  estimatedDealValue: number; // USD
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface FollowUpItem {
  id: string;
  leadId: string;
  leadName: string;
  leadCategory: string;
  date: string;
  time?: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'PHONE' | 'MEETING';
  note: string;
  completed: boolean;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'LINKEDIN';
  targetAudience: string;
  subject?: string;
  body: string;
}

export interface HarvestSearchParams {
  city: string;
  lat?: number;
  lon?: number;
  radiusKm: number;
  category: string;
  keyword?: string;
}

export interface CategoryPreset {
  id: string;
  label: string;
  icon: string;
  overpassFilter: string;
  description: string;
  avgDealValue: number;
}

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  priceMonthlyUSD: number;
  priceYearlyUSD: number;
  priceMonthlyINR: number;
  priceYearlyINR: number;
  harvestLimitMonthly: number;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: SubscriptionTier;
  status: 'active' | 'suspended';
  harvestsUsedThisMonth?: number;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}
