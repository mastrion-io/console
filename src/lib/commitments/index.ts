// The seven promises in corporate/mastrion/website/DECISIONS.md that are marked LIVE &
// VERIFIABLE, mapped to the console route that proves them. Kept as data (not JSX) so
// commitments.test.ts can assert that the page and the claims cannot drift apart: a claim whose
// state is "proven" must name a route, and the number of unproven claims is a test constant.
//
// Updated 2026-11-07 (console #4, [MST-OPS-004 follows]). Sources: DECISIONS.md rows, the merged
// commit list on mastrion-io/console main, and the observed /api/events behaviour.

export type CommitmentState = 'proven' | 'fixture' | 'not-built' | 'external';

export interface Commitment {
  id: string;
  claim: string;
  /** The console route that proves it, or null when there is no route. */
  proof: string | null;
  state: CommitmentState;
  note?: string;
}

export const COMMITMENTS: Commitment[] = [
  {
    id: 'P1',
    claim: 'Sub-2.4 ms in-line PII redaction.',
    proof: null,
    state: 'not-built',
    note: 'The landing page shows 2.12 ms; nothing in the console measures it. No route, no acceptance test.',
  },
  {
    id: 'P2',
    claim: 'Radix-tree KV prefix cache reclaiming 62 percent of GPU VRAM.',
    proof: null,
    state: 'not-built',
    note: 'The mission-control card renders a fixture (68.4 percent, 3.42M tokens). It is a chart of numbers, not a measurement.',
  },
  {
    id: 'P3',
    claim: 'Dynamic cost routing between local and frontier models.',
    proof: '/finance/arbitrage',
    state: 'proven',
    note: 'Arbitrage ledger, merged 2026-11-06 16:27.',
  },
  {
    id: 'P4',
    claim: 'EU AI Act Article 12 signed, exportable audit record.',
    proof: '/finance/close-pack',
    state: 'proven',
    note: 'HMAC-chained close pack with ledger verification, merged 2026-11-06 20:03.',
  },
  {
    id: 'P5',
    claim: 'Ambient waypoint status, live.',
    proof: '/api/events',
    state: 'fixture',
    note: 'Now proxies mastriond :8085 when the daemon is up, and says so in X-Mastrion-Upstream; with the daemon down it returns an explicit error event instead of a silent fixture.',
  },
  {
    id: 'P6',
    claim: 'Hardware SKU A/B/C comparison.',
    proof: null,
    state: 'external',
    note: 'Hardware, not software. Nothing in this console can prove it.',
  },
  {
    id: 'P7',
    claim: 'Brand, typography and responsive behaviour.',
    proof: null,
    state: 'external',
    note: 'Held by the website repo, not the console.',
  },
];

export interface CommitmentCounts {
  total: number;
  proven: number;
  fixture: number;
  notBuilt: number;
  external: number;
  notProven: number;
}

export function summarizeCommitments(list: Commitment[]): CommitmentCounts {
  const count = (state: CommitmentState): number => list.filter((c) => c.state === state).length;
  const proven = count('proven');
  const fixture = count('fixture');
  const notBuilt = count('not-built');
  return {
    total: list.length,
    proven,
    fixture,
    notBuilt,
    external: count('external'),
    notProven: list.length - proven,
  };
}
