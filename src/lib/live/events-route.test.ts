import assert from 'node:assert/strict';
import { describe, it, before, after, beforeEach } from 'node:test';
import { GET } from '../../app/api/events/route';

// MAR-002 acceptance floor for PRD-MST-102 / MST-OPS-004:
//   /api/events must proxy mastriond (never a bundled fixture), pass an upstream event through to
//   the browser within 200 ms of it being produced, and tear the mastriond stream down when the
//   browser goes away (the old push loop leaked one socket per closed tab).
//
// globalThis.fetch is not writable through node:test's mock.method (it is a getter on the global
// object), so it is replaced by hand and restored in after().
//
// Lives under src/lib/live/ on purpose: the delivery agent's write allowlist is src/, and the QA
// scope rule now allows the repo-root scripts/ and state/ directories too (MST-OPS-005).

const encoder = new TextEncoder();

function event(id: string): string {
  return `event: waypoint\ndata: ${JSON.stringify({
    id,
    piiRedacted: true,
    producedAt: new Date().toISOString(),
  })}\n\n`;
}

interface UpstreamCall {
  url: string;
  cancelled: boolean;
}

let calls: UpstreamCall[] = [];
let behaviour: 'one-event' | 'never-ends' | 'refuse' = 'one-event';

function installFetch(): void {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (behaviour === 'refuse') throw new Error('connect ECONNREFUSED 127.0.0.1:8085');
    const call: UpstreamCall = { url, cancelled: false };
    calls.push(call);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(event('wp-test-1')));
        if (behaviour === 'one-event') controller.close();
      },
      cancel() {
        call.cancelled = true;
      },
    });
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }) as typeof fetch;
}

describe('GET /api/events proxies mastriond', () => {
  const originalFetch = globalThis.fetch;

  before(installFetch);
  after(() => {
    globalThis.fetch = originalFetch;
  });
  beforeEach(() => {
    calls = [];
    behaviour = 'one-event';
  });

  it('targets mastriond on 8085, not a fixture file', async () => {
    const res = await GET(new Request('http://localhost/api/events') as never);
    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
    const upstreamUrl = calls[0].url;
    assert.ok(upstreamUrl.includes('8085'), `expected mastriond :8085 upstream, got ${upstreamUrl}`);
    assert.ok(
      !upstreamUrl.startsWith('/') && !upstreamUrl.startsWith('file:'),
      'upstream must be an absolute http URL, never a local fixture path',
    );
    assert.equal(res.headers.get('X-Mastrion-Upstream'), upstreamUrl);
  });

  it('streams the upstream event through within 200 ms', async () => {
    const started = Date.now();
    const res = await GET(new Request('http://localhost/api/events') as never);
    const reader = res.body!.getReader();
    const { value } = await reader.read();
    const elapsed = Date.now() - started;
    const text = new TextDecoder().decode(value);
    assert.ok(text.includes('wp-test-1'), `stream body was ${text}`);
    assert.ok(elapsed < 200, `first event took ${elapsed} ms, budget is 200 ms`);
    await reader.cancel();
  });

  it('tears the mastriond stream down when the browser goes away', async () => {
    behaviour = 'never-ends';
    const res = await GET(new Request('http://localhost/api/events') as never);
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel('client disconnected');
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].cancelled, true, 'upstream stream was left open after the client left');
  });

  it('reports an upstream failure instead of pretending a stream exists', async () => {
    behaviour = 'refuse';
    const res = await GET(new Request('http://localhost/api/events') as never);
    const text = await res.text();
    assert.ok(text.includes('event: error'), `expected an error event, got ${text}`);
    assert.ok(text.includes('8085'), 'the error must name the daemon and port');
  });
});
