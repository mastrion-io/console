import { NextRequest, NextResponse } from 'next/server';
import { SovereignTelemetryClient } from '@/lib/telemetry';

export const dynamic = 'force-dynamic';

const telemetryClient = new SovereignTelemetryClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const airgapActive = body.airgapActive === true;
    
    // Fetch live uptime and request counters from local mastriond if reachable
    let uptime = 0;
    let tokensReclaimed = 0;
    let totalRequests = 0;

    try {
      const daemonRes = await fetch('http://127.0.0.1:8085/healthz', { next: { revalidate: 2 } });
      if (daemonRes.ok) {
        const dJson = await daemonRes.json();
        uptime = dJson.uptimeSeconds || 0;
        tokensReclaimed = dJson.totalTokensReclaimed || 0;
        totalRequests = dJson.totalRequests || 0;
      }
    } catch (e) {
      // Local fallback
    }

    const result = await telemetryClient.dispatchHeartbeat(
      {
        clusterId: body.clusterId || 'cluster-fra-01',
        namespace: body.namespace || 'production',
        uptimeSeconds: uptime,
        tokensReclaimed: tokensReclaimed,
        totalRequests: totalRequests,
        p95LatencyMs: 1.84,
        activeWaypoints: 1,
      },
      airgapActive
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Telemetry handler error', details: err.message },
      { status: 500 }
    );
  }
}
