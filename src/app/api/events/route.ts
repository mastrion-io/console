import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const upstreamUrl = process.env.MASTRIOND_EVENTS_URL || 'http://127.0.0.1:8085/admin/events';

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ error: 'Failed to connect to mastriond daemon on 8085', details: err.message })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  }

  if (!upstreamResponse.body) {
    return new Response('No upstream stream body', { status: 502 });
  }

  // MAR-002: relay with a pull-driven stream. The previous push loop (while (read) enqueue) looked
  // identical on the happy path but sat parked in an await that a client disconnect could not
  // interrupt, so every closed browser tab leaked a mastriond stream into the proxy. With pull(),
  // a chunk is fetched only when the browser asks for it, and cancel() tears the upstream down.
  const upstream = upstreamResponse;
  const upstreamReader = upstream.body!.getReader();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await upstreamReader.read();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(value);
    },
    cancel(reason) {
      void upstreamReader.cancel(reason).catch(() => { /* upstream already gone */ });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      // Evidence for PRD-MST-102 / MST-OPS-004: the response names the daemon it is really
      // streaming from, so a fixture masquerading as a stream cannot hide behind a 200.
      'X-Mastrion-Upstream': upstreamUrl,
    },
  });
}
