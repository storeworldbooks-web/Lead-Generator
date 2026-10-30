'use client';

import React from 'react';
import { formatCurrency } from '@/utils';
import {
  TrendingUp,
  Users,
  Flame,
  DollarSign,
  Trophy,
  AlertTriangle,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';

interface DashboardStatsProps {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  pipelineValue: number;
  wonCount: number;
  totalOpportunityLeak: number;
  followUpsToday: number;
}

export default function DashboardStats({
  totalLeads,
  hotLeads,
  warmLeads,
  pipelineValue,
  wonCount,
  totalOpportunityLeak,
  followUpsToday,
}: DashboardStatsProps) {
  const stats = [
    {
      id: 'total',
      label: 'Total Leads Harvested',
      value: totalLeads,
      suffix: '',
      icon: MapPin,
      iconBg: 'bg-indigo-500/15 border-indigo-500/30',
      iconColor: 'text-indigo-400',
      subLabel: 'via OSM Overpass API',
      trend: '+12 this week',
      trendUp: true,
    },
    {
      id: 'hot',
      label: 'Hot Opportunity Leads',
      value: hotLeads,
      suffix: '',
      icon: Flame,
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      iconColor: 'text-rose-400',
      subLabel: 'Score ≥ 70 – Pitch now',
      trend: `${warmLeads} warm staged`,
      trendUp: true,
    },
    {
      id: 'pipeline',
      label: 'Active Pipeline Value',
      value: pipelineValue,
      suffix: '',
      isCurrency: true,
      icon: DollarSign,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      subLabel: 'Across all pipeline stages',
      trend: `${wonCount} deals won`,
      trendUp: true,
    },
    {
      id: 'leak',
      label: 'Total Market Revenue Leak',
      value: totalOpportunityLeak,
      suffix: '/mo',
      isCurrency: true,
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      iconColor: 'text-amber-400',
      subLabel: 'Missed bookings by your leads',
      trend: 'Tap to close deals',
      trendUp: false,
    },
    {
      id: 'won',
      label: 'Deals Won',
      value: wonCount,
      suffix: '',
      icon: Trophy,
      iconBg: 'bg-yellow-500/15 border-yellow-500/30',
      iconColor: 'text-yellow-400',
      subLabel: 'Closed revenue contracts',
      trend: `${Math.round((wonCount / Math.max(totalLeads, 1)) * 100)}% conversion`,
      trendUp: true,
    },
    {
      id: 'followups',
      label: 'Follow-ups Due Today',
      value: followUpsToday,
      suffix: ' tasks',
      icon: Calendar,
      iconBg: 'bg-blue-500/15 border-blue-500/30',
      iconColor: 'text-blue-400',
      subLabel: 'Scheduled touch-points',
      trend: 'Review calendar',
      trendUp: followUpsToday > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-orange-950/20 transition group cursor-default backdrop-blur-sm"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${stat.iconBg}`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <ArrowUpRight
                className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition ${
                  stat.trendUp ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
            </div>

            {/* Value */}
            <div className="mb-1">
              <div className="text-xl font-extrabold text-white leading-none">
                {stat.isCurrency
                  ? formatCurrency(stat.value as number)
                  : `${stat.value}${stat.suffix}`}
              </div>
            </div>

            {/* Label */}
            <div>
              <p className="text-[11px] font-semibold text-slate-300 leading-tight mb-0.5">{stat.label}</p>
              <p className="text-[10px] text-slate-500">{stat.subLabel}</p>
              <div className={`text-[10px] font-medium mt-1.5 ${stat.trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stat.trend}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
