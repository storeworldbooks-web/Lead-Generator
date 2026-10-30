import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata: Metadata = {
  title: 'LeadGenerator – B2B Lead Generation & Local SEO SaaS',
  description:
    'Harvest local business leads using OpenStreetMap, scan websites for revenue opportunities, generate personalized outreach, and manage client pipelines with Cloudflare-powered infrastructure.',
  keywords: 'local SEO, lead generation, B2B, OpenStreetMap, Overpass API, Cloudflare Workers, D1 database',
  authors: [{ name: 'LeadGenerator' }],
  openGraph: {
    title: 'LeadGenerator',
    description: 'B2B Lead Harvesting & Local SEO Opportunity Scanner',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" />
        <link rel="preconnect" href="https://overpass-api.de" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
