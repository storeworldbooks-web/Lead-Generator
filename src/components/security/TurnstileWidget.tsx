'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  className?: string;
}

export default function TurnstileWidget({
  siteKey = '1x00000000000000000000AA', // Cloudflare Turnstile always-pass test sitekey
  onVerify,
  className = '',
}: TurnstileWidgetProps) {
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Simulated / Edge turnstile verification
  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const mockToken = `cf_turnstile_token_${Date.now()}`;
      setVerified(true);
      setIsVerifying(false);
      onVerify(mockToken);
    }, 600);
  };

  return (
    <div className={`p-3 rounded-lg border border-slate-800 bg-slate-950/70 text-xs ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Lock className="w-3 h-3" />
          </div>
          <div>
            <span className="font-semibold text-slate-300 block">Cloudflare Turnstile Protection</span>
            <span className="text-[10px] text-slate-500">Zero-cost edge bot verification</span>
          </div>
        </div>

        <div>
          {verified ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-sm transition"
            >
              {isVerifying ? 'Verifying...' : 'Verify Human'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
