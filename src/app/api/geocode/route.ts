import { NextRequest, NextResponse } from 'next/server';
import { searchLocation } from '@/lib/osm/nominatim';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  try {
    const results = await searchLocation(q);
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Geocoding failed' }, { status: 500 });
  }
}
