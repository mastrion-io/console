import React from 'react';
import { Link } from 'lucide-react';
import { COMMITMENTS, summarizeCommitments } from '@/lib/commitments';

export const metadata = {
  title: 'Commitments | Mastrion Console',
  description: 'Every public LIVE claim, and the console route that proves it, on one page.',
};

export const dynamic = 'force-dynamic';

const STATE_LABEL: Record<string, string> = {
  proven: 'PROVEN IN CONSOLE',
  fixture: 'FIXTURE ONLY',
  'not-built': 'NOT BUILT',
  external: 'NOT SOFTWARE',
};

const STATE_CLASS: Record<string, string> = {
  proven: 'bg-emerald-950 border-emerald-800 text-emerald-300',
  fixture: 'bg-amber-950 border-amber-800 text-amber-300',
  'not-built': 'bg-rose-950 border-rose-800 text-rose-300',
  external: 'bg-slate-900 border-slate-700 text-slate-300',
};

// MAR-002: the demo used to be a slide deck plus three routes a viewer had to be talked through.
// This page is the talk: each row is a claim made publicly, the route that proves it, and - where
// there is no route - the word NOT BUILT, so a claim cannot be demoed as live when it is not.
// The fixtures live in src/lib/commitments.ts next to this list and are asserted by
// src/lib/commitments.test.ts, so the page cannot drift from the numbers.
export default function CommitmentsPage() {
  const counts = summarizeCommitments(COMMITMENTS);

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">Commitments</h1>
        <p className="text-sm text-slate-400">
          Seven promises marked LIVE &amp; VERIFIABLE in <code>DECISIONS.md</code>, each mapped to
          the console route that proves it. {counts.proven} are provable in this console today,{' '}
          {counts.notProven} are not.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Proven</div>
          <div className="mt-1 font-mono text-2xl text-emerald-300">{counts.proven}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Fixture only</div>
          <div className="mt-1 font-mono text-2xl text-amber-300">{counts.fixture}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Not built</div>
          <div className="mt-1 font-mono text-2xl text-rose-300">{counts.notBuilt}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Claimed</div>
          <div className="mt-1 font-mono text-2xl text-slate-200">{counts.total}</div>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-4 font-medium">#</th>
            <th className="py-2 pr-4 font-medium">Claim (public)</th>
            <th className="py-2 pr-4 font-medium">Proof</th>
            <th className="py-2 pr-4 font-medium">State</th>
          </tr>
        </thead>
        <tbody>
          {COMMITMENTS.map((c) => (
            <tr key={c.id} className="border-b border-slate-900 align-top">
              <td className="py-3 pr-4 font-mono text-xs text-slate-500">{c.id}</td>
              <td className="py-3 pr-4">
                <div className="text-slate-200">{c.claim}</div>
                {c.note ? <div className="mt-1 text-xs text-slate-500">{c.note}</div> : null}
              </td>
              <td className="py-3 pr-4">
                {c.proof ? (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-sky-300">
                    <Link className="h-3 w-3" aria-hidden />
                    {c.proof}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">no route</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${STATE_CLASS[c.state]}`}
                >
                  {STATE_LABEL[c.state]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-slate-500">
        Counts are derived from this list and asserted by <code>commitments.test.ts</code>. If a
        claim has no route, the demo says NOT BUILT; it is not narrated as live.
      </p>
    </main>
  );
}
