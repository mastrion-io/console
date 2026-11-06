import { promises as fs } from 'fs';
import path from 'path';
import type { AuditReceipt } from './close-pack';

const LEDGER_PATH = path.join(process.cwd(), 'state', 'audit-ledger.jsonl');

/**
 * Reads the append-only audit ledger. Missing file is treated as an empty
 * ledger so a fresh environment can still produce a (empty) close pack.
 */
export async function readAuditLedger(): Promise<AuditReceipt[]> {
  let raw: string;
  try {
    raw = await fs.readFile(LEDGER_PATH, 'utf8');
  } catch {
    return [];
  }

  const receipts: AuditReceipt[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') {
      continue;
    }
    try {
      const parsed = JSON.parse(trimmed) as Partial<AuditReceipt>;
      if (
        typeof parsed.seq === 'number' &&
        typeof parsed.recordedAt === 'string' &&
        typeof parsed.actor === 'string' &&
        typeof parsed.action === 'string' &&
        typeof parsed.transactionId === 'string' &&
        Array.isArray(parsed.complianceStandards) &&
        typeof parsed.payloadHash === 'string' &&
        typeof parsed.hmac === 'string' &&
        typeof parsed.prevHmac === 'string'
      ) {
        receipts.push({
          seq: parsed.seq,
          recordedAt: parsed.recordedAt,
          actor: parsed.actor,
          action: parsed.action,
          transactionId: parsed.transactionId,
          complianceStandards: parsed.complianceStandards.filter(
            (s): s is string => typeof s === 'string',
          ),
          payloadHash: parsed.payloadHash,
          hmac: parsed.hmac,
          prevHmac: parsed.prevHmac,
        });
      }
    } catch {
      // Skip malformed lines; the chain check will surface the gap.
    }
  }

  return receipts.sort((a, b) => a.seq - b.seq);
}

/**
 * Appends exactly one ledger entry. The caller is responsible for supplying the
 * document hash so the export is traceable.
 */
export async function appendAuditLedgerEntry(receipt: AuditReceipt): Promise<void> {
  await fs.mkdir(path.dirname(LEDGER_PATH), { recursive: true });
  await fs.appendFile(LEDGER_PATH, `${JSON.stringify(receipt)}\n`, 'utf8');
}
