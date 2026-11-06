import { ArbitrageLedger } from '@/components/finance/ArbitrageLedger';
import {
  RATES,
  buildRouteLedgerRow,
  summariseSavings,
  type ModelRoute,
} from '@/lib/finance/rates';

const ROUTES: ModelRoute[] = [
  {
    id: 'route-sovereign-llama',
    name: 'Sovereign Llama 70B',
    tier: 'sovereign',
    tokensIn: 18_400_000,
    tokensOut: 6_200_000,
  },
  {
    id: 'route-sovereign-mistral',
    name: 'Sovereign Mistral Large',
    tier: 'sovereign',
    tokensIn: 9_100_000,
    tokensOut: 3_400_000,
  },
  {
    id: 'route-hybrid-router',
    name: 'Hybrid Escalation Router',
    tier: 'hybrid',
    tokensIn: 2_300_000,
    tokensOut: 900_000,
  },
  {
    id: 'route-frontier-gpt',
    name: 'Frontier GPT-class',
    tier: 'frontier',
    tokensIn: 1_200_000,
    tokensOut: 480_000,
  },
  {
    id: 'route-sovereign-idle',
    name: 'Sovereign Qwen 32B (staged)',
    tier: 'sovereign',
    tokensIn: 0,
    tokensOut: 0,
  },
];

export default function ArbitragePage() {
  const rows = ROUTES.map((route) => buildRouteLedgerRow(route, RATES));
  const todaySaving = 412.8;
  const elapsedDaysInMonth = 15;
  const summary = summariseSavings(rows, todaySaving, elapsedDaysInMonth);

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">
          Local versus frontier arbitrage
        </h1>
        <p className="text-sm text-slate-400">
          Ledger of model routes with the saving realised against frontier
          pricing, and the break-even volume for sovereign capacity.
        </p>
      </header>

      <ArbitrageLedger
        rows={rows}
        summary={summary}
        rates={RATES}
        elapsedDaysInMonth={elapsedDaysInMonth}
      />
    </main>
  );
}
