import { FINANCE_TOOLS } from '@/lib/finance/tools/registry';
import { GOLDEN_TRANSCRIPT } from '@/lib/finance/tools/goldenTranscript';

export default function FinanceToolsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">Finance read tools</h1>
        <p className="text-sm text-slate-400">
          Six read-only tools exposed to the finance agent. All figures are fixture data and every
          result carries a source and asOf timestamp.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FINANCE_TOOLS.map((tool) => (
          <article
            key={tool.name}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
          >
            <h2 className="font-mono text-sm text-brand-400">{tool.name}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tool.inputSchema.required.length === 0 ? (
                <span className="text-[11px] text-slate-500">no required arguments</span>
              ) : (
                tool.inputSchema.required.map((field) => (
                  <span
                    key={field}
                    className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800/60 text-slate-300"
                  >
                    {field}
                  </span>
                ))
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Golden transcript</h2>
        <ul className="space-y-2">
          {GOLDEN_TRANSCRIPT.map((turn) => (
            <li key={turn.question} className="text-xs text-slate-400">
              <span className="text-slate-200">{turn.question}</span>
              <span className="text-slate-500"> → </span>
              <span className="font-mono text-brand-400">
                {turn.calls.map((c) => c.tool).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
