import assert from 'node:assert/strict';
import { describe, it, after } from 'node:test';
import type { NextRequest } from 'next/server';
import { POST } from '../../app/api/proxy/route';

// MAR-002: the sandbox on the console home page calls POST /api/proxy, which used to forward any
// body to mastriond and render a 502 with the daemon's raw error text when the daemon was down.
// That is the path a demo takes when it wants to show "the model answering live": if it answers
// from a fixture, the demo is a lie. So the route now names its upstream in a header and refuses
// an empty or malformed body before it touches the network.

const originalFetch = globalThis.fetch;

interface Call {
  url: string;
  body: unknown;
}

function installFetch(response: () => Response | Promise<Response>): Call[] {
  const calls: Call[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      body: init && init.body ? JSON.parse(String(init.body)) : null,
    });
    return response();
  }) as typeof fetch;
  return calls;
}

// The route only ever uses req.json(), so a plain Request is a faithful stand-in for
// NextRequest here; the cast keeps the test free of Next's request internals.
function post(body: unknown): NextRequest {
  return new Request('http://localhost/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/proxy forwards to mastriond', () => {
  after(() => {
    globalThis.fetch = originalFetch;
  });

  it('names the upstream it really used, on 8085', async () => {
    const calls = installFetch(() => Response.json({ id: 'chatcmpl-1', choices: [] }));
    const res = await POST(post({ model: 'local', messages: [] }));
    await res.json();
    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.includes('8085'), `expected mastriond :8085, got ${calls[0].url}`);
    assert.equal(res.headers.get('X-Mastrion-Upstream'), calls[0].url);
  });

  it('passes the caller body through unchanged', async () => {
    const body = { model: 'local/llama', messages: [{ role: 'user', content: 'hi' }] };
    const calls = installFetch(() => Response.json({ choices: [] }));
    await POST(post(body));
    assert.deepEqual(calls[0].body, body);
  });

  it('returns the upstream status instead of pretending a 200', async () => {
    installFetch(() => new Response(JSON.stringify({ error: 'rate limited' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    }));
    const res = await POST(post({ model: 'local', messages: [] }));
    assert.equal(res.status, 429);
  });

  it('refuses a malformed body before calling the daemon', async () => {
    const calls = installFetch(() => Response.json({}));
    const res = await POST(new Request('http://localhost/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    }) as unknown as NextRequest);
    assert.equal(res.status, 400);
    assert.equal(calls.length, 0, 'a malformed body must not reach mastriond');
  });

  it('says the daemon is unreachable rather than returning an empty answer', async () => {
    globalThis.fetch = (async () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:8085');
    }) as typeof fetch;
    const res = await POST(post({ model: 'local', messages: [] }));
    const payload = await res.json();
    assert.equal(res.status, 502);
    assert.ok(String(payload.error).includes('mastriond'), `error was ${JSON.stringify(payload)}`);
    assert.equal(payload.answeredBy, 'none', 'a failed proxy must not claim an answer');
  });
});
