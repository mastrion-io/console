# Demo, 2026-11-07 19:20

Three things, two minutes. The console is already running on **http://127.0.0.1:3010**.

## 1. Commitments - the page that stops us over-claiming

<http://127.0.0.1:3010/finance/commitments>

Seven public promises from `DECISIONS.md`, each with the route that proves it:

- **P3 dynamic cost routing** -> `/finance/arbitrage` - PROVEN
- **P4 EU AI Act Art.12 signed export** -> `/finance/close-pack` - PROVEN
- **P5 live waypoint status** -> `/api/events` - live when the daemon is up
- **P1 PII latency, P2 radix cache** -> NOT BUILT. The mission-control card is a chart of fixture
  numbers; nothing measures them.
- **P6 hardware, P7 brand** -> not software

A claim cannot be marked PROVEN without a route: `src/lib/commitments/commitments.test.ts` fails if
one is added without proof.

## 2. The stream is real, and it proves it

```
curl -sN -D- http://127.0.0.1:3010/api/events
```

Headers name the daemon (`x-mastrion-upstream: http://127.0.0.1:8085/admin/events`) and the body is
mastriond's own event bus:

```
event: connect
data: {"message":"Connected to mastriond live event bus","uptime":99712.89}

event: metrics.snapshot
data: {"activeClients":29,"tokensReclaimed":0,"totalRequests":4,"uptimeSeconds":99714.0}
```

If mastriond is down, the same route returns `event: error` naming port 8085 - it does not fall back
to a fixture. That, the 200 ms budget and the disconnect teardown are the four tests in
`src/lib/live/events-route.test.ts`.

## 3. The close pack chain verifies

The `state/audit-ledger.jsonl` in this checkout has two receipts. Generate a pack over them:

```
curl -s -X POST http://127.0.0.1:3010/api/finance/close-pack \
  -H 'Content-Type: application/json' \
  -d '{"periodStart":"2026-11-01","periodEnd":"2026-11-08","actor":"demo"}'
```

`document.auditReceipts` has both, `ledgerChain` is `{firstSeq: 1, lastSeq: 2, headHmac: ...}`, and both
HMACs recompute from the dev secret with `prevHmac` chaining GENESIS -> 1 -> 2. Genuinely verifiable,
not decorative.

## What is not real

- The finance KPIs, invoices and routes still read `state/finops-metering.json` under
  `platform/mastrion-core/`, which does not exist, so those panels are labelled `source: fixture,
  degraded: true` and say so on screen. mastriond exposes `mastrion_tokens_reclaimed_total` on
  `/metrics` and nothing about spend, so the fixture is honest for now - but it is a fixture.
- The PII redaction table and the radix cache chart are static numbers.
- `GET /api/events` is live; the four files in `public/` that older pages use are not.

## The gate

```
scripts/verify.sh          # typecheck, unit, build, SSE contract
scripts/verify.sh --fast   # skips the build
```

Full run on this branch: 20 unit tests pass, 4 SSE contract tests pass, all 14 finance routes build.
