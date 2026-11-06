import { parseDateRange } from './dates';
import { INVOICES } from './fixtures';
import { errorResult, FIXTURE_SOURCE, nowIso, type ToolResult } from './types';

export type InvoiceStatus = 'paid' | 'open' | 'overdue';

export interface ListInvoicesArgs {
  status?: InvoiceStatus;
  vendor?: string;
  from?: string;
  to?: string;
}

export interface InvoiceRow {
  id: string;
  vendor: string;
  status: InvoiceStatus;
  issuedOn: string;
  dueOn: string;
  netEur: number;
  ustEur: number;
  grossEur: number;
  overdue: boolean;
}

export interface ListInvoicesData {
  invoices: InvoiceRow[];
  totals: { netEur: number; ustEur: number; grossEur: number };
}

export function listInvoices(args: ListInvoicesArgs): ToolResult<ListInvoicesData> {
  let from: string | undefined;
  let to: string | undefined;
  if (args.from !== undefined || args.to !== undefined) {
    if (args.from === undefined || args.to === undefined) {
      return errorResult(
        'Both from and to must be supplied together when filtering invoices by date.',
        'Provide both from and to as ISO dates (YYYY-MM-DD), or omit both.',
      );
    }
    const parsed = parseDateRange(args.from, args.to);
    if (!parsed.ok) return errorResult(parsed.error, parsed.hint);
    from = parsed.range.from;
    to = parsed.range.to;
  }

  const today = nowIso().slice(0, 10);
  const rows = INVOICES.filter((inv) => {
    if (args.status !== undefined && inv.status !== args.status) return false;
    if (args.vendor !== undefined && inv.vendor !== args.vendor) return false;
    if (from !== undefined && to !== undefined && (inv.issuedOn < from || inv.issuedOn > to)) return false;
    return true;
  });

  const invoices: InvoiceRow[] = rows.map((inv) => {
    const ustEur = round2(inv.netEur * inv.ustRate);
    return {
      id: inv.id,
      vendor: inv.vendor,
      status: inv.status,
      issuedOn: inv.issuedOn,
      dueOn: inv.dueOn,
      netEur: round2(inv.netEur),
      ustEur,
      grossEur: round2(inv.netEur + ustEur),
      overdue: inv.status === 'overdue' || (inv.status !== 'paid' && inv.dueOn < today),
    };
  });

  const totals = invoices.reduce(
    (acc, inv) => ({
      netEur: round2(acc.netEur + inv.netEur),
      ustEur: round2(acc.ustEur + inv.ustEur),
      grossEur: round2(acc.grossEur + inv.grossEur),
    }),
    { netEur: 0, ustEur: 0, grossEur: 0 },
  );

  const overdueCount = invoices.filter((i) => i.overdue).length;
  const humanSummary =
    invoices.length === 0
      ? 'No invoices matched the filter. Data is a fixture.'
      : `${invoices.length} invoice(s) matched: net EUR ${totals.netEur.toFixed(2)}, USt EUR ${totals.ustEur.toFixed(2)}, gross EUR ${totals.grossEur.toFixed(2)}. ${overdueCount} overdue. Data is a fixture.`;

  return {
    data: { invoices, totals },
    humanSummary,
    source: FIXTURE_SOURCE,
    asOf: nowIso(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
