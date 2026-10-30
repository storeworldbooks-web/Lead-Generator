'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AppFooter from '@/components/layout/AppFooter';
import { SUBSCRIPTION_PLANS } from '@/lib/plans';
import { useAuth } from '@/lib/auth/AuthContext';
import { SubscriptionTier } from '@/types';
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Flame,
  Star,
} from 'lucide-react';

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [upgradingTier, setUpgradingTier] = useState<SubscriptionTier | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (!user) {
      window.location.href = `/login?from=/pricing`;
      return;
    }

    if (user.plan === tier) {
      return;
    }

    setUpgradingTier(tier);
    try {
      // In this SaaS architecture, we allow user plan simulation or instant switch
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: tier }),
      });

      if (res.ok) {
        setSuccessMsg(`Congratulations! Your account has been upgraded to ${tier} tier.`);
        await refreshUser();
      } else {
        alert('Could not update subscription plan. Please try again.');
      }
    } catch {
      alert('Network error updating subscription plan.');
    } finally {
      setUpgradingTier(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 pl-16">
        <Topbar
          pageTitle="Subscription Plans"
          pageSubtitle="Affordable, High-ROI Lead Generation & Website Intelligence"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Hero Banner */}
          <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Affordable B2B Growth Engine • No Hidden Scraping Fees</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display">
              Plans Built for Solo Hustlers & High-Growth Agencies
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Harvest verified local business leads across any global city with OpenStreetMap, scan digital opportunity gaps, and close high-ticket clients with instant PDF audits.
            </p>

            {/* Currency & Billing Cycle Toggles */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {/* Billing Cycle Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-[#ff6a13] to-[#ffaa00] text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Yearly Billing</span>
                  <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-bold">
                    Save 20%
                  </span>
                </button>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${
                    currency === 'USD'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${
                    currency === 'INR'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  INR (₹)
                </button>
              </div>
            </div>
          </div>

          {/* Upgrade Alert Message */}
          {successMsg && (
            <div className="max-w-2xl mx-auto p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button
                onClick={() => setSuccessMsg(null)}
                className="opacity-70 hover:opacity-100 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = user?.plan === plan.id;
              const isPopular = plan.isPopular;

              const price =
                currency === 'USD'
                  ? billingCycle === 'yearly'
                    ? plan.priceYearlyUSD
                    : plan.priceMonthlyUSD
                  : billingCycle === 'yearly'
                  ? plan.priceYearlyINR
                  : plan.priceMonthlyINR;

              const currencySymbol = currency === 'USD' ? '$' : '₹';

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl flex flex-col justify-between p-6 transition-all duration-200 relative ${
                    isPopular
                      ? 'bg-gradient-to-b from-slate-900 to-slate-900/95 border-2 border-orange-500 shadow-2xl shadow-orange-500/15 lg:-translate-y-2'
                      : 'bg-slate-900/80 border border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#ff6a13] to-[#ffaa00] text-slate-950 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 fill-slate-950" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white font-display">
                          {plan.name}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Active Plan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 min-h-[32px]">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="py-4 border-y border-slate-800/80 mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl lg:text-4xl font-extrabold text-white font-display">
                          {price === 0 ? 'Free' : `${currencySymbol}${price}`}
                        </span>
                        {price > 0 && (
                          <span className="text-xs text-slate-400 font-medium">
                            / month
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {price === 0
                          ? 'Zero credit card required'
                          : billingCycle === 'yearly'
                          ? 'Billed annually (~20% savings applied)'
                          : 'Billed monthly, cancel anytime'}
                      </p>
                    </div>

                    {/* Limit Highlight */}
                    <div className="mb-5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white">
                          {plan.harvestLimitMonthly.toLocaleString()} Leads
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">/ month quota</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight text-slate-300">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrent || upgradingTier === plan.id}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                          : isPopular
                          ? 'bg-gradient-to-r from-[#ff6a13] to-[#ffaa00] text-white hover:brightness-110 shadow-orange-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      {upgradingTier === plan.id ? (
                        <span>Updating Plan...</span>
                      ) : isCurrent ? (
                        <span>Current Active Plan</span>
                      ) : (
                        <>
                          <span>{plan.ctaText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enterprise Support Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 border border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h3 className="text-sm font-bold text-white font-display">
                  Need Custom Team Seats, Custom Invoicing, or High-Volume Dedicated Endpoints?
                </h3>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">
                LeadGenerator provides dedicated harvesting bandwidth, custom CRM integration webhooks, and team management for digital agencies.
              </p>
            </div>
            <a
              href="mailto:support@leadgenerator.io?subject=Enterprise%20Plan%20Inquiry"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a13] to-[#ffaa00] hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-orange-500/20 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact Enterprise Support</span>
            </a>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-white font-display text-center">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>Where does LeadGenerator pull business leads from?</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We query OpenStreetMap via real-time spatial Overpass API instances. This includes geo-coordinates, verified phone numbers, website URLs, and physical business addresses with zero third-party API rate costs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>How does Website Opportunity Scanning work?</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Our Cloudflare Workers crawler analyzes each business domain for missing SSL certificates, absent mobile viewports, missing Schema.org structured data, and lack of WhatsApp booking buttons—calculating an estimated monthly revenue leak you can pitch to the client.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>Can I export leads to Excel & CRM?</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Yes! All plans include standard CSV export. Paid plans unlock direct XLSX spreadsheets via SheetJS and downloadable executive PDF proposals with custom agency branding.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>Can I upgrade, downgrade or cancel anytime?</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Yes, subscriptions can be modified or paused at any time without long-term contracts. Your lead data and CRM pipeline remain permanently saved in your Cloudflare D1 account.
                </p>
              </div>
            </div>
          </div>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
