import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getTierColor(tier: 'HOT' | 'WARM' | 'COLD'): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  dot: string;
} {
  switch (tier) {
    case 'HOT':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-500 shadow-rose-500/50',
      };
    case 'WARM':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-500 shadow-amber-500/50',
      };
    case 'COLD':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-500 shadow-emerald-500/50',
      };
  }
}

export function cleanPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

export function getWhatsAppLink(phone?: string, text?: string): string {
  if (!phone) return '#';
  const clean = cleanPhone(phone).replace(/^\+/, '');
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${clean}${encodedText ? `?text=${encodedText}` : ''}`;
}

export function getMailtoLink(email?: string, subject?: string, body?: string): string {
  if (!email) return '#';
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
}
