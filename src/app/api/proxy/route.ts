import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstreamUrl = process.env.MASTRIOND_PLAYGROUND_URL || 'http://127.0.0.1:8085/v1/chat/completions';

  try {
    const res = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to proxy to mastriond waypoint', details: err.message },
      { status: 502 }
    );
  }
}
