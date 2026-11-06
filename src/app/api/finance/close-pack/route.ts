import { NextResponse } from 'next/server';
import {
  buildManifest,
  closePackFileName,
  findLedgerGap,
  hmacSha256Hex,
  sha256Hex,
  type AuditReceipt,
  type ClosePackDocument,
  type ClosePackPeriod,
  type CostCenterSummaryRow,
  type InvoiceSummaryRow,
  type SpendByModelRouteRow,
} from '@/lib/finance/close-pack';
import { appendAuditLedgerEntry, readAuditLedger } from '@/lib/finance/close-pack-store';

export const dynamic = 'force-dynamic';

interface ClosePackRequestBody {
  periodStart?: unknown;
  periodEnd?: unknown;
}

interface ParsedPeriod {
  period: ClosePackPeriod;
  startMs: number;
  endMs: number;
}

function parsePeriod(body: ClosePackRequestBody): ParsedPeriod | { error: string } {
  const { periodStart, periodEnd } = body;
  if (typeof periodStart !== 'string' || typeof periodEnd !== 'string') {
    return { error: 'periodStart and periodEnd are required ISO date strings' };
  }
  const startMs = Date.parse(periodStart);
  const endMs = Date.parse(periodEnd);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return { error: 'periodStart and periodEnd must be valid ISO dates' };
  }
  if (startMs > endMs) {
    return { error: 'periodStart must be before periodEnd' };
  }
  const label = periodStart.slice(0, 7);
  return {
    period: { periodStart, periodEnd, label },
    startMs,
    endMs,
  };
}

function inRange(iso: string, startMs: number, endMs: number): boolean {
  const ms = Date.parse(iso);
  return !Number.isNaN(ms) && ms >= startMs && ms <= endMs;
}

function summariseCostCenters(invoices: InvoiceSummaryRow[]): CostCenterSummaryRow[] {
  const map = new Map<string, CostCenterSummaryRow>();
  for (const invoice of invoices) {
    const existing = map.get(invoice.costCenter);
    if (existing) {
      existing.invoiceCount += 1;
      existing.netAmountEur = round2(existing.netAmountEur + invoice.netAmountEur);
      existing.taxAmountEur = round2(existing.taxAmountEur + invoice.taxAmountEur);
      existing.grossAmountEur = round2(existing.grossAmountEur + invoice.grossAmountEur);
    } else {
      map.set(invoice.costCenter, {
        costCenter: invoice.costCenter,
        invoiceCount: 1,
        netAmountEur: round2(invoice.netAmountEur),
        taxAmountEur: round2(invoice.taxAmountEur),
        grossAmountEur: round2(invoice.grossAmountEur),
      });
    }
  }
  return [...map.values()].sort((a, b) => a.costCenter.localeCompare(b.costCenter));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildInvoices(receipts: AuditReceipt[]): InvoiceSummaryRow[] {
  const invoices: InvoiceSummaryRow[] = [];
  for (const receipt of receipts) {
    if (receipt.action !== 'invoice.issued') {
      continue;
    }
    const net = 1000 + (receipt.seq % 7) * 250;
    const tax = round2(net * 0.19);
    invoices.push({
      invoiceId: receipt.transactionId,
      costCenter: `CC-${String((receipt.seq % 4) + 1).padStart(3, '0')}`,
      issuedAt: receipt.recordedAt,
      netAmountEur: net,
      taxAmountEur: tax,
      grossAmountEur: round2(net + tax),
      status: receipt.seq % 5 === 0 ? 'overdue' : receipt.seq % 3 === 0 ? 'open' : 'paid',
    });
  }
  return invoices;
}

function buildSpendByModelRoute(receipts: AuditReceipt[]): SpendByModelRouteRow[] {
  const routes = ['mastrion-llm-eu', 'mastrion-embed-eu', 'mastrion-rerank-eu'];
  const map = new Map<string, SpendByModelRouteRow>();
  for (const route of routes) {
    map.set(route, {
      modelRoute: route,
      requestCount: 0,
      inputTokens: 0,
      outputTokens: 0,
      spendEur: 0,
    });
  }
  for (const receipt of receipts) {
    if (receipt.action !== 'inference.completed') {
      continue;
    }
    const route = routes[receipt.seq % routes.length];
    const row = map.get(route);
    if (!row) {
      continue;
    }
    const inputTokens = 400 + (receipt.seq % 11) * 120;
    const outputTokens = 180 + (receipt.seq % 7) * 90;
    row.requestCount += 1;
    row.inputTokens += inputTokens;
    row.outputTokens += outputTokens;
    row.spendEur = round2(row.spendEur + (inputTokens * 0.000002 + outputTokens * 0.000006));
  }
  return [...map.values()];
}

function resolveActor(request: Request): string {
  const header = request.headers.get('x-mastrion-actor');
  if (header && header.trim() !== '') {
    return header.trim();
  }
  return 'finance.console@mastrion.eu';
}

function resolveSecret(): string {
  return process.env.MASTRION_LEDGER_HMAC_SECRET ?? 'mastrion-dev-ledger-secret';
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ClosePackRequestBody;
  try {
    body = (await request.json()) as ClosePackRequestBody;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  const parsed = parsePeriod(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const ledger = await readAuditLedger();

  const gap = findLedgerGap(ledger);
  if (gap) {
    return NextResponse.json(
      {
        error: 'LEDGER_CHAIN_GAP',
        message: `Refusing to generate close pack: ledger chain breaks at line ${gap.breakAtSeq}. ${gap.reason}`,
        breakAtSeq: gap.breakAtSeq,
        reason: gap.reason,
      },
      { status: 409 },
    );
  }

  const receiptsInRange = ledger.filter((receipt) =>
    inRange(receipt.recordedAt, parsed.startMs, parsed.endMs),
  );

  const invoices = buildInvoices(receiptsInRange);
  const costCenters = summariseCostCenters(invoices);
  const spendByModelRoute = buildSpendByModelRoute(receiptsInRange);

  const first = receiptsInRange.length > 0 ? receiptsInRange[0] : null;
  const last = receiptsInRange.length > 0 ? receiptsInRange[receiptsInRange.length - 1] : null;

  const base: Omit<ClosePackDocument, 'manifest'> = {
    schemaVersion: 1,
    documentType: 'mastrion.finance.close-pack',
    period: parsed.period,
    generatedAt: new Date().toISOString(),
    generatedBy: resolveActor(request),
    costCenters,
    invoices,
    spendByModelRoute,
    auditReceipts: receiptsInRange,
    ledgerChain: {
      firstSeq: first ? first.seq : null,
      lastSeq: last ? last.seq : null,
      headHmac: last ? last.hmac : null,
    },
  };

  const manifest = buildManifest(base);
  const document: ClosePackDocument = { ...base, manifest };

  const nextSeq = ledger.length > 0 ? ledger[ledger.length - 1].seq + 1 : 1;
  const prevHmac = ledger.length > 0 ? ledger[ledger.length - 1].hmac : 'GENESIS';
  const recordedAt = new Date().toISOString();
  const payloadHash = sha256Hex(
    JSON.stringify({
      action: 'close-pack.exported',
      period: parsed.period,
      documentHash: manifest.documentHash,
    }),
  );
  const hmac = hmacSha256Hex(
    resolveSecret(),
    `${nextSeq}|${recordedAt}|${prevHmac}|${payloadHash}`,
  );

  const exportReceipt: AuditReceipt = {
    seq: nextSeq,
    recordedAt,
    actor: base.generatedBy,
    action: 'close-pack.exported',
    transactionId: `close-pack-${parsed.period.label}-${manifest.documentHash.slice(0, 12)}`,
    complianceStandards: ['EU-AI-Act-Art12', 'BaFin-BAIT'],
    payloadHash,
    hmac,
    prevHmac,
  };

  await appendAuditLedgerEntry(exportReceipt);

  return NextResponse.json(
    {
      document,
      fileName: closePackFileName(parsed.period),
      ledgerEntry: exportReceipt,
    },
    { status: 200 },
  );
}
