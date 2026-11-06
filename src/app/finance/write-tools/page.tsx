import { ShieldCheck, AlertTriangle, FileText, Tag, Gauge, Scale } from 'lucide-react';

interface ToolSpec {
  name: string;
  icon: 'gauge' | 'tag' | 'file' | 'scale';
  description: string;
  args: string[];
  rejection: string[];
}

const TOOLS: ToolSpec[] = [
  {
    name: 'set_budget_cap',
    icon: 'gauge',
    description:
      'Sets the daily spend ceiling for a cost center. Requests above the cap reroute to local sovereign models at zero marginal cost.',
    args: ['costCenter', 'dailyCapCents', 'reason (>= 10 chars)'],
    rejection: ['Missing or short reason', 'Cap above ceiling', 'Non-positive cap'],
  },
  {
    name: 'tag_cost_center',
    icon: 'tag',
    description: 'Moves an invoice or spend bucket to a different cost center. Writes both before and after values.',
    args: ['entityId', 'costCenter', 'reason (>= 10 chars)'],
    rejection: ['Missing or short reason', 'Unknown entity'],
  },
  {
    name: 'export_close_pack',
    icon: 'file',
    description:
      'Produces the close pack document for a period and returns a download id. No money moves; recorded for audit only.',
    args: ['periodStart', 'periodEnd'],
    rejection: ['Missing period bounds', 'Inverted period'],
  },
  {
    name: 'open_invoice_dispute',
    icon: 'scale',
    description: 'Sets an invoice status to disputed and records the reason.',
    args: ['invoiceId', 'reason (>= 10 chars)', 'expectedNetCents (optional)'],
    rejection: ['Missing or short reason', 'Unknown invoice', 'Invoice already paid', 'Net mismatch'],
  },
];

function ToolIcon({ kind }: { kind: ToolSpec['icon'] }) {
  if (kind === 'gauge') return <Gauge className="w-4 h-4" />;
  if (kind === 'tag') return <Tag className="w-4 h-4" />;
  if (kind === 'file') return <FileText className="w-4 h-4" />;
  return <Scale className="w-4 h-4" />;
}

export default function WriteToolsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Guarded write tools</h1>
          <p className="text-sm text-slate-400 mt-1">
            Four write operations gated by the confirmation flow. Every call is dry-run first, then confirmed by a human,
            then applied exactly once with an idempotency key derived from the confirmation id.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          Confirmation required
        </span>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <article
            key={tool.name}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-slate-200">
              <span className="p-1.5 rounded-md bg-slate-800 text-brand-400">
                <ToolIcon kind={tool.icon} />
              </span>
              <code className="font-mono text-sm text-slate-100">{tool.name}</code>
            </div>
            <p className="text-sm text-slate-400">{tool.description}</p>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Arguments</div>
              <ul className="flex flex-wrap gap-1.5">
                {tool.args.map((arg) => (
                  <li
                    key={arg}
                    className="font-mono text-[11px] text-slate-300 bg-slate-800/70 border border-slate-700/60 px-1.5 py-0.5 rounded"
                  >
                    {arg}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Rejected before confirmation</div>
              <ul className="space-y-1">
                {tool.rejection.map((r) => (
                  <li key={r} className="flex items-center gap-1.5 text-xs text-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-200">Policy</h2>
        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
          <li>Only one write tool may be invoked per turn. A human must review the previous write before another can be proposed.</li>
          <li>Confirmation ids expire after five minutes and are single-use.</li>
          <li>Retrying a confirmed call with the same id applies the change once; the ledger records the replay.</li>
          <li>Every write records actor, tool, argument hash, redacted summary, before, after and confirmation id.</li>
        </ul>
      </section>
    </main>
  );
}
