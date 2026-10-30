import { NextRequest, NextResponse } from 'next/server';
import { harvestOverpassLeads } from '@/lib/osm/overpass';
import { validateSessionToken, incrementHarvestUsage } from '@/lib/auth/authStore';
import { getPlanDetails } from '@/lib/plans';
import { HarvestSearchParams } from '@/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to harvest leads.' },
        { status: 401 }
      );
    }

    const user = await validateSessionToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Contact support.' },
        { status: 403 }
      );
    }

    // Plan quota enforcement
    const planDetails = getPlanDetails(user.plan);
    const used = user.harvestsUsedThisMonth ?? 0;
    const limit = planDetails.harvestLimitMonthly;

    if (used >= limit) {
      return NextResponse.json(
        {
          error: `Monthly harvest quota reached. Your ${planDetails.name} plan allows ${limit.toLocaleString()} leads/month. You have used ${used.toLocaleString()}.`,
          quotaExceeded: true,
          plan: user.plan,
          limit,
          used,
          upgradeUrl: '/pricing',
        },
        { status: 429 }
      );
    }

    const body: HarvestSearchParams = await request.json();

    if (!body.city && (!body.lat || !body.lon)) {
      return NextResponse.json({ error: 'City or coordinates are required' }, { status: 400 });
    }

    // For FREE plan, cap radius to 5km; STARTER 10km; PRO/AGENCY unlimited (50km max)
    const maxRadius =
      user.plan === 'FREE' ? 5 :
      user.plan === 'STARTER' ? 10 :
      50;

    if (body.radiusKm > maxRadius) {
      body.radiusKm = maxRadius;
    }

    const leads = await harvestOverpassLeads(body);

    // Clamp results to remaining quota
    const remaining = limit - used;
    const clampedLeads = leads.slice(0, remaining);

    // Increment usage count in store
    if (clampedLeads.length > 0) {
      await incrementHarvestUsage(user.id, clampedLeads.length);
    }

    return NextResponse.json({
      success: true,
      count: clampedLeads.length,
      city: body.city,
      category: body.category,
      leads: clampedLeads,
      quota: {
        plan: user.plan,
        planName: planDetails.name,
        limit,
        used: used + clampedLeads.length,
        remaining: Math.max(0, limit - used - clampedLeads.length),
      },
    });
  } catch (error: any) {
    console.error('Harvest API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to harvest business leads' },
      { status: 500 }
    );
  }
}
