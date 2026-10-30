'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AppFooter from '@/components/layout/AppFooter';
import { useAuth } from '@/lib/auth/AuthContext';
import { User, SubscriptionTier } from '@/types';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  CreditCard,
  Search,
  Filter,
  Trash2,
  Edit2,
  RefreshCw,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Database,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminCount: number;
  tierBreakdown: Record<SubscriptionTier, number>;
  totalHarvestsUsed: number;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Guard: Admin role required
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    setIsDataLoading(true);
    try {
      const [usersRes, metricsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/metrics'),
      ]);

      if (usersRes.ok) {
        const userData = await usersRes.json();
        if (userData.success && userData.users) {
          setUsers(userData.users);
        }
      }

      if (metricsRes.ok) {
        const metricData = await metricsRes.json();
        if (metricData.success && metricData.metrics) {
          setMetrics(metricData.metrics);
        }
      }
    } catch (err: any) {
      setFeedbackMsg({ text: 'Failed to load admin data: ' + err.message, type: 'error' });
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const handleUpdateUser = async (userId: string, updates: { role?: string; plan?: SubscriptionTier; status?: string }) => {
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('User updated successfully', 'success');
        fetchAdminData();
      } else {
        showNotification(data.message || 'Failed to update user', 'error');
      }
    } catch (err: any) {
      showNotification('Network error updating user', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${email}?`)) {
      return;
    }
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`User ${email} deleted`, 'success');
        fetchAdminData();
      } else {
        showNotification(data.message || 'Failed to delete user', 'error');
      }
    } catch {
      showNotification('Network error deleting user', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400">Verifying administrator privileges...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Access Denied</h2>
          <p className="text-xs text-slate-400">
            This area is strictly restricted to LeadGenerator administrators. You will be redirected to the main dashboard shortly.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Return to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || u.plan === filterPlan;
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesPlan && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 pl-16">
        <Topbar
          pageTitle="Admin Command Center"
          pageSubtitle="User Governance, SaaS Subscriptions & Edge Infrastructure"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/30 border border-slate-800/80 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-extrabold text-white font-display">
                  LeadGenerator SuperAdmin Oversight
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  MASTER PRIVILEGES
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">
                Manage user access, allocate subscription quotas, toggle account statuses, and monitor system-wide lead generation usage.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 shrink-0">
              <button
                onClick={fetchAdminData}
                disabled={isDataLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDataLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Registered</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white font-display">
                {metrics?.totalUsers ?? users.length}
              </div>
              <div className="text-[10px] text-slate-500">
                {metrics?.adminCount ?? 1} Admins • {((metrics?.totalUsers ?? users.length) - (metrics?.adminCount ?? 1))} Users
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Active Accounts</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-display">
                {metrics?.activeUsers ?? users.filter((u) => u.status === 'active').length}
              </div>
              <div className="text-[10px] text-slate-500">
                {metrics?.suspendedUsers ?? users.filter((u) => u.status === 'suspended').length} Suspended
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Paid Subscriptions</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 font-display">
                {(metrics?.tierBreakdown?.STARTER || 0) +
                  (metrics?.tierBreakdown?.PRO || 0) +
                  (metrics?.tierBreakdown?.AGENCY || 0)}
              </div>
              <div className="text-[10px] text-slate-500">
                Free: {metrics?.tierBreakdown?.FREE || 0} | Pro: {metrics?.tierBreakdown?.PRO || 0} | Agency: {metrics?.tierBreakdown?.AGENCY || 0}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Monthly Quota Used</span>
                <Activity className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400 font-display">
                {metrics?.totalHarvestsUsed ?? 0}
              </div>
              <div className="text-[10px] text-slate-500">
                Leads harvested across all accounts
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
            {/* Table Controls */}
            <div className="p-4 border-b border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Plan Filter */}
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="ALL">All Plans</option>
                  <option value="FREE">Free Starter</option>
                  <option value="STARTER">Solopreneur</option>
                  <option value="PRO">Pro Growth</option>
                  <option value="AGENCY">Agency Scale</option>
                </select>

                {/* Role Filter */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="ALL">All Roles</option>
                  <option value="user">Standard User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Quota Used</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No users found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrentUser = u.id === user.id;
                      const isUpdating = updatingId === u.id;

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-850/50 transition-colors group"
                        >
                          {/* User info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff6a13] to-[#ffaa00] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-semibold text-white truncate flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrentUser && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              disabled={isCurrentUser || isUpdating}
                              onChange={(e) =>
                                handleUpdateUser(u.id, { role: e.target.value })
                              }
                              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition ${
                                u.role === 'admin'
                                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                                  : 'bg-slate-950 text-slate-300 border-slate-800'
                              } ${isCurrentUser ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:border-slate-700'}`}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          {/* Plan */}
                          <td className="py-3 px-4">
                            <select
                              value={u.plan || 'FREE'}
                              disabled={isUpdating}
                              onChange={(e) =>
                                handleUpdateUser(u.id, {
                                  plan: e.target.value as SubscriptionTier,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                u.plan === 'AGENCY'
                                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                                  : u.plan === 'PRO'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                                  : u.plan === 'STARTER'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                  : 'bg-slate-950 text-slate-400 border-slate-800'
                              }`}
                            >
                              <option value="FREE">FREE (50/mo)</option>
                              <option value="STARTER">STARTER (1,000/mo)</option>
                              <option value="PRO">PRO GROWTH (5,000/mo)</option>
                              <option value="AGENCY">AGENCY (25,000/mo)</option>
                            </select>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <button
                              disabled={isCurrentUser || isUpdating}
                              onClick={() =>
                                handleUpdateUser(u.id, {
                                  status: u.status === 'active' ? 'suspended' : 'active',
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 ${
                                u.status === 'active'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
                                  : 'bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/50'
                              } ${isCurrentUser ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              <span>{u.status === 'active' ? 'Active' : 'Suspended'}</span>
                            </button>
                          </td>

                          {/* Quota used */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-300 font-semibold">
                              {u.harvestsUsedThisMonth || 0} leads
                            </span>
                          </td>

                          {/* Registered */}
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {!isCurrentUser && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                disabled={isUpdating}
                                title="Delete User Account"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Showing {filteredUsers.length} of {users.length} accounts</span>
              <span>Cloudflare D1 & Edge Sync Active</span>
            </div>
          </div>

          {/* Infrastructure & Security Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Database className="w-4 h-4 text-orange-400" />
                <span>Cloudflare D1 Storage</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero-cold-start SQL relational persistence deployed at 300+ global edge locations. Fast sub-5ms query response times.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Primary replication healthy</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>OpenStreetMap Overpass Engine</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Live spatial query engine harvesting local enterprises, coordinates, addresses, and phone contacts with zero API keys required.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Rate limits auto-throttled</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Enterprise Governance & Quotas</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Multi-seat billing, automated monthly lead limit resets, and custom API batch endpoints configured at the edge.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Security policies active</span>
              </div>
            </div>
          </div>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
