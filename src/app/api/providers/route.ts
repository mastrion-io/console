import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ADMIN_STATE } from '@/lib/models/initial-state';
import { FrontierProviderConfig } from '@/lib/models/types';

let providers: FrontierProviderConfig[] = [...INITIAL_ADMIN_STATE.frontierProviders];

export async function GET() {
  return NextResponse.json({
    providers,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, apiKey, enabled, baseUrl, maxCostCapDailyEur } = body;

    const idx = providers.findIndex((p) => p.id === providerId);
    if (idx === -1) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const current = providers[idx];
    providers[idx] = {
      ...current,
      enabled: enabled !== undefined ? enabled : current.enabled,
      baseUrl: baseUrl || current.baseUrl,
      maxCostCapDailyEur: maxCostCapDailyEur !== undefined ? maxCostCapDailyEur : current.maxCostCapDailyEur,
      apiKeyMasked: apiKey ? `${apiKey.slice(0, 7)}••••••••••••${apiKey.slice(-4)}` : current.apiKeyMasked,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, provider: providers[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
