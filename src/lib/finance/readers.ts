import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { FinanceSource } from './types';

export interface FinopsState {
  source: FinanceSource;
  asOf: string;
  degraded: boolean;
  payload: Record<string, unknown> | null;
}

export interface AuditLedgerEntry {
  line: number;
  raw: string;
  parsed: Record<string, unknown> | null;
}

export interface AuditLedgerResult {
  source: FinanceSource;
  asOf: string;
  degraded: boolean;
  entries: AuditLedgerEntry[];
  truncatedFinalLine: boolean;
}

const FINOPS_STATE_PATH = path.join(
  process.cwd(),
  'platform',
  'mastrion-core',
  'state',
  'finops-metering.json',
);

const AUDIT_LEDGER_PATH = path.join(process.cwd(), 'state', 'audit-ledger.jsonl');

const LEDGER_LINE_CAP = 500;

function nowIso(): string {
  return new Date().toISOString();
}

export async function readFinopsState(): Promise<FinopsState> {
  try {
    const raw = await fs.readFile(FINOPS_STATE_PATH, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('finops state is not an object');
    }
    const record = parsed as Record<string, unknown>;
    const asOf = typeof record.asOf === 'string' ? record.asOf : nowIso();
    return {
      source: 'finops',
      asOf,
      degraded: false,
      payload: record,
    };
  } catch {
    return {
      source: 'fixture',
      asOf: nowIso(),
      degraded: true,
      payload: null,
    };
  }
}

export async function readAuditLedger(lineCap: number = LEDGER_LINE_CAP): Promise<AuditLedgerResult> {
  const cap = Number.isFinite(lineCap) && lineCap > 0 ? Math.floor(lineCap) : LEDGER_LINE_CAP;
  try {
    const raw = await fs.readFile(AUDIT_LEDGER_PATH, 'utf8');
    const lines = raw.split('\n');
    const entries: AuditLedgerEntry[] = [];
    let truncatedFinalLine = false;
    for (let i = 0; i < lines.length && entries.length < cap; i += 1) {
      const rawLine = lines[i] ?? '';
      const trimmed = rawLine.trim();
      if (trimmed.length === 0) {
        continue;
      }
      const isLastNonEmpty = i === lines.length - 1 || (i === lines.length - 2 && (lines[lines.length - 1] ?? '').trim() === '');
      let parsed: Record<string, unknown> | null = null;
      try {
        const candidate: unknown = JSON.parse(trimmed);
        if (candidate !== null && typeof candidate === 'object' && !Array.isArray(candidate)) {
          parsed = candidate as Record<string, unknown>;
        }
      } catch {
        if (isLastNonEmpty) {
          truncatedFinalLine = true;
        }
        parsed = null;
      }
      entries.push({ line: i + 1, raw: trimmed, parsed });
    }
    return {
      source: 'ledger',
      asOf: nowIso(),
      degraded: false,
      entries,
      truncatedFinalLine,
    };
  } catch {
    return {
      source: 'fixture',
      asOf: nowIso(),
      degraded: true,
      entries: [],
      truncatedFinalLine: false,
    };
  }
}
