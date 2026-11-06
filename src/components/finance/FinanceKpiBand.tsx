import React from 'react';
import { FinanceKpiTile } from '@/components/finance/FinanceKpiTile';
import type { FinanceKpisResponse } from '@/lib/finance';

export interface FinanceKpiBandProps {
  data: FinanceKpisResponse;
}

export function FinanceKpiBand({ data }: FinanceKpiBandProps) {
  return (
    <section aria-label="Finance headline KPIs" className="space-y-3">
      {data.degraded && (
        <div
          role="status"
          className="inline-flex items-center gap-2 rounded-lg border border-amber-700/70 bg-amber-950/50 px-3 py-1.5 text-xs font-semibold text-amber-200"
        >
          <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
          Fixture data — not live
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {data.tiles.map((tile) => (
          <FinanceKpiTile key={tile.id} tile={tile} asOf={data.asOf} source={data.source} />
        ))}
      </div>
    </section>
  );
}
