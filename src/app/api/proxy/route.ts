import { NextRequest, NextResponse } from 'next/server';

// MAR-002: the sandbox on the console home page posts here to show the model answering live.
// Three things changed so that path cannot quietly become a fixture:
//   - a malformed body is rejected locally (400) instead of forwarded to mastriond;
//   - the upstream that actually answered is named in X-Mastrion-Upstream;
//   - an unreachable daemon returns 502 with answeredBy: 'none', so a caller that renders the
//     response has nothing to render and cannot present an empty object as an answer.
// See src/lib/live/proxy-route.test.ts for the contract.

export async function POST(req: NextRequest) {
  const upstreamUrl =
    process.env.MASTRIOND_PLAYGROUND_URL || 'http://127.0.0.1:8085/v1/chat/completions';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body is not valid JSON', answeredBy: 'none' },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: { 'X-Mastrion-Upstream': upstreamUrl },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Failed to proxy to mastriond waypoint',
        details: err?.message ?? String(err),
        answeredBy: 'none',
      },
      { status: 502, headers: { 'X-Mastrion-Upstream': upstreamUrl } },
    );
  }
}
