'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@leadgenerator.io');
    setPassword('Password123!');
    setError(null);
    setLoading(true);

    try {
      await login('demo@leadgenerator.io', 'Password123!');
    } catch (err: any) {
      setError(err?.message || 'Demo sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setEmail('admin@leadgenerator.io');
    setPassword('Admin123!');
    setError(null);
    setLoading(true);

    try {
      await login('admin@leadgenerator.io', 'Admin123!');
    } catch (err: any) {
      setError(err?.message || 'Admin sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff6a13] to-[#ffaa00] shadow-xl shadow-orange-500/25 mb-4">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-1.5 font-display">
            <span>LeadGenerator</span>
            <span className="text-amber-400 text-base">⚡</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            B2B Lead Harvesting & Opportunity Scanner SaaS
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sign in to manage your harvested leads and pipeline.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@agency.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-orange-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-orange-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#ff6a13] to-[#ffaa00] hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sign In Options */}
          <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>⚡ One-Click Admin Sign In (SuperAdmin)</span>
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Demo User Sign In (Alex)</span>
            </button>

            <p className="text-[10px] text-slate-500 text-center pt-1">
              D1 Cloudflare Authenticated PBKDF2 Web Crypto
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium">
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secured by Cloudflare D1 & Edge Sessions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
