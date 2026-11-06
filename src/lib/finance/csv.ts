import type { CostCenter } from './costCenters';
import { formatEurPlain, utilisationPercent } from './costCenters';

export type CostCenterSortKey =
  | 'name'
  | 'owner'
  | 'mtdSpendCents'
  | 'budgetCents'
  | 'utilisation'
  | 'projectedMonthEndCents'
  | 'deltaCents';

export type SortDirection = 'asc' | 'desc';

export interface CostCenterRow {
  id: string;
  name: string;
  owner: string;
  mtdSpendCents: number;
  budgetCents: number;
  utilisation: number;
  projectedMonthEndCents: number;
  deltaCents: number;
}

export function toRow(cc: CostCenter): CostCenterRow {
  return {
    id: cc.id,
    name: cc.name,
    owner: cc.owner,
    mtdSpendCents: cc.mtdSpendCents,
    budgetCents: cc.budgetCents,
    utilisation: utilisationPercent(cc.mtdSpendCents, cc.budgetCents),
    projectedMonthEndCents: cc.projectedMonthEndCents,
    deltaCents: cc.mtdSpendCents - cc.lastMonthSpendCents,
  };
}

export function sortRows(
  rows: CostCenterRow[],
  key: CostCenterSortKey,
  direction: SortDirection,
): CostCenterRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (key === 'name' || key === 'owner') {
      return a[key].localeCompare(b[key], 'de-DE');
    }
    return a[key] - b[key];
  });
  return direction === 'asc' ? sorted : sorted.reverse();
}

function csvEscape(value: string): string {
  if (/[";\n\r]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function buildCostCenterCsv(rows: CostCenterRow[]): string {
  const header = [
    'name',
    'owner',
    'mtd_spend_cents',
    'mtd_spend_eur',
    'budget_cents',
    'budget_eur',
    'utilisation_percent',
    'projected_month_end_cents',
    'projected_month_end_eur',
    'delta_cents',
    'delta_eur',
  ];

  const lines: string[] = [header.join(';')];

  for (const row of rows) {
    const cells = [
      csvEscape(row.name),
      csvEscape(row.owner),
      String(row.mtdSpendCents),
      formatEurPlain(row.mtdSpendCents),
      String(row.budgetCents),
      formatEurPlain(row.budgetCents),
      formatEurPlain(Math.round(row.utilisation * 10) / 10),
      String(row.projectedMonthEndCents),
      formatEurPlain(row.projectedMonthEndCents),
      String(row.deltaCents),
      formatEurPlain(row.deltaCents),
    ];
    lines.push(cells.join(';'));
  }

  return lines.join('\r\n') + '\r\n';
}

export function csvFilename(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `mastrion-cost-centers-${y}-${m}-${d}.csv`;
}
