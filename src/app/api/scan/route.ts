import { NextRequest, NextResponse } from 'next/server';
import { performSiteAudit } from '@/lib/scanner/audit';
import { Lead } from '@/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { lead }: { lead: Lead } = await request.json();

    if (!lead) {
      return NextResponse.json({ error: 'Missing lead object' }, { status: 400 });
    }

    if (!lead.website) {
      const audit = performSiteAudit(lead);
      return NextResponse.json({ success: true, audit });
    }

    let url = lead.website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    let htmlContent = '';
    let statusCode = 200;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 LocalLead-AI-Bot/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      statusCode = res.status;
      // Get first 150KB of HTML to scan headers, meta, schema, scripts
      const text = await res.text();
      htmlContent = text.slice(0, 150000);
    } catch (fetchErr: any) {
      console.warn(`Could not reach ${url}:`, fetchErr.message);
      statusCode = 503;
    }

    const audit = performSiteAudit(lead, htmlContent, statusCode);
    return NextResponse.json({ success: true, audit });
  } catch (error: any) {
    console.error('Scan API error:', error);
    return NextResponse.json({ error: error.message || 'Audit scan failed' }, { status: 500 });
  }
}
