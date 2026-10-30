import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Interface for Cloudflare D1 environment binding
interface Env {
  DB?: {
    prepare: (query: string) => any;
  };
}

export async function GET(request: NextRequest) {
  try {
    // If running on Cloudflare Pages/Workers with D1 binding
    const env = (process.env as unknown) as Env;
    if (env.DB) {
      const stmt = env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 100');
      const { results } = await stmt.all();
      return NextResponse.json({ leads: results, source: 'cloudflare-d1' });
    }

    // Default response indicating D1 binding capability
    return NextResponse.json({
      message: 'Cloudflare D1 binding ready. In local dev, store persists in browser localStorage.',
      source: 'local-store',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const lead = await request.json();
    const env = (process.env as unknown) as Env;

    if (env.DB) {
      const stmt = env.DB.prepare(`
        INSERT INTO leads (
          id, name, category, address, city, lat, lon, phone, email, website,
          osm_id, opportunity_score, opportunity_tier, pipeline_stage, estimated_deal_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await stmt.bind(
        lead.id,
        lead.name,
        lead.category,
        lead.address,
        lead.city,
        lead.lat,
        lead.lon,
        lead.phone || '',
        lead.email || '',
        lead.website || '',
        lead.osmId || '',
        lead.opportunityScore || 0,
        lead.opportunityTier || 'COLD',
        lead.pipelineStage || 'DISCOVERED',
        lead.estimatedDealValue || 1500
      ).run();

      return NextResponse.json({ success: true, id: lead.id, persistedTo: 'cloudflare-d1' });
    }

    return NextResponse.json({ success: true, id: lead.id, persistedTo: 'client-store' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
