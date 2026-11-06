import { createHash, createHmac, timingSafeEqual } from 'crypto';

export type ClosePackSectionKey =
  | 'period'
  | 'costCenters'
  | 'invoices'
  | 'spendByModelRoute'
  | 'auditReceipts';

export interface CostCenterSummaryRow {
  costCenter: string;
  invoiceCount: number;
  netAmountEur: number;
  taxAmountEur: number;
  grossAmountEur: number;
}

export interface InvoiceSummaryRow {
  invoiceId: string;
  costCenter: string;
  issuedAt: string;
  netAmountEur: number;
  taxAmountEur: number;
  grossAmountEur: number;
  status: 'paid' | 'open' | 'overdue';
}

export interface SpendByModelRouteRow {
  modelRoute: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  spendEur: number;
}

export interface AuditReceipt {
  seq: number;
  recordedAt: string;
  actor: string;
  action: string;
  transactionId: string;
  complianceStandards: string[];
  payloadHash: string;
  hmac: string;
  prevHmac: string;
}

export interface ClosePackPeriod {
  periodStart: string;
  periodEnd: string;
  label: string;
}

export interface ClosePackManifest {
  algorithm: 'sha256';
  sectionHashes: Record<ClosePackSectionKey, string>;
  documentHash: string;
}

export interface ClosePackDocument {
  schemaVersion: 1;
  documentType: 'mastrion.finance.close-pack';
  period: ClosePackPeriod;
  generatedAt: string;
  generatedBy: string;
  costCenters: CostCenterSummaryRow[];
  invoices: InvoiceSummaryRow[];
  spendByModelRoute: SpendByModelRouteRow[];
  auditReceipts: AuditReceipt[];
  ledgerChain: {
    firstSeq: number | null;
    lastSeq: number | null;
    headHmac: string | null;
  };
  manifest: ClosePackManifest;
}

export interface SectionVerificationResult {
  section: ClosePackSectionKey;
  expectedHash: string;
  actualHash: string;
  passed: boolean;
}

export interface ChainVerificationResult {
  passed: boolean;
  checkedReceipts: number;
  breakAtSeq: number | null;
  breakReason: string | null;
}

export interface ClosePackVerificationResult {
  passed: boolean;
  documentHashPassed: boolean;
  sections: SectionVerificationResult[];
  chain: ChainVerificationResult;
}

export interface LedgerGap {
  breakAtSeq: number;
  reason: string;
}

const SECTION_KEYS: ClosePackSectionKey[] = [
  'period',
  'costCenters',
  'invoices',
  'spendByModelRoute',
  'auditReceipts',
];

/**
 * Deterministic JSON serialisation: object keys are sorted recursively so that
 * a hash computed on the server matches a hash recomputed in the browser after
 * a JSON round trip.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      sorted[key] = sortValue(record[key]);
    }
    return sorted;
  }
  return value;
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export function hmacSha256Hex(secret: string, input: string): string {
  return createHmac('sha256', secret).update(input, 'utf8').digest('hex');
}

export function safeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export function sectionPayload(
  doc: Omit<ClosePackDocument, 'manifest'>,
  section: ClosePackSectionKey,
): unknown {
  switch (section) {
    case 'period':
      return doc.period;
    case 'costCenters':
      return doc.costCenters;
    case 'invoices':
      return doc.invoices;
    case 'spendByModelRoute':
      return doc.spendByModelRoute;
    case 'auditReceipts':
      return doc.auditReceipts;
  }
}

export function computeSectionHashes(
  doc: Omit<ClosePackDocument, 'manifest'>,
): Record<ClosePackSectionKey, string> {
  const hashes = {} as Record<ClosePackSectionKey, string>;
  for (const key of SECTION_KEYS) {
    hashes[key] = sha256Hex(canonicalJson(sectionPayload(doc, key)));
  }
  return hashes;
}

export function computeDocumentHash(
  sectionHashes: Record<ClosePackSectionKey, string>,
): string {
  const ordered = SECTION_KEYS.map((key) => `${key}:${sectionHashes[key]}`).join('|');
  return sha256Hex(ordered);
}

export function buildManifest(
  doc: Omit<ClosePackDocument, 'manifest'>,
): ClosePackManifest {
  const sectionHashes = computeSectionHashes(doc);
  return {
    algorithm: 'sha256',
    sectionHashes,
    documentHash: computeDocumentHash(sectionHashes),
  };
}

/**
 * Recomputes every section hash and the document hash, then walks the receipt
 * chain to confirm continuity. Tampering with a single figure fails exactly the
 * section that carries it.
 */
export function verifyClosePack(doc: ClosePackDocument): ClosePackVerificationResult {
  const { manifest, ...rest } = doc;
  const recomputed = computeSectionHashes(rest);

  const sections: SectionVerificationResult[] = SECTION_KEYS.map((section) => {
    const expectedHash = manifest.sectionHashes[section] ?? '';
    const actualHash = recomputed[section];
    return {
      section,
      expectedHash,
      actualHash,
      passed: expectedHash !== '' && safeHexEqual(expectedHash, actualHash),
    };
  });

  const recomputedDocumentHash = computeDocumentHash(recomputed);
  const documentHashPassed = safeHexEqual(manifest.documentHash, recomputedDocumentHash);

  const chain = verifyReceiptChain(doc.auditReceipts);

  return {
    passed: documentHashPassed && chain.passed && sections.every((s) => s.passed),
    documentHashPassed,
    sections,
    chain,
  };
}

/**
 * Verifies that the receipts included in the pack form an unbroken chain: each
 * receipt's prevHmac must equal the previous receipt's hmac and sequence
 * numbers must be contiguous.
 */
export function verifyReceiptChain(receipts: AuditReceipt[]): ChainVerificationResult {
  if (receipts.length === 0) {
    return { passed: true, checkedReceipts: 0, breakAtSeq: null, breakReason: null };
  }

  const sorted = [...receipts].sort((a, b) => a.seq - b.seq);

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const current = sorted[i];
    if (current.seq !== prev.seq + 1) {
      return {
        passed: false,
        checkedReceipts: i,
        breakAtSeq: current.seq,
        breakReason: `Sequence gap between ${prev.seq} and ${current.seq}`,
      };
    }
    if (!safeHexEqual(current.prevHmac, prev.hmac)) {
      return {
        passed: false,
        checkedReceipts: i,
        breakAtSeq: current.seq,
        breakReason: `prevHmac of receipt ${current.seq} does not match hmac of receipt ${prev.seq}`,
      };
    }
  }

  return {
    passed: true,
    checkedReceipts: sorted.length,
    breakAtSeq: null,
    breakReason: null,
  };
}

/**
 * Detects a gap in the full ledger chain. Returns the first break so the caller
 * can refuse to generate a pack and report the offending line.
 */
export function findLedgerGap(receipts: AuditReceipt[]): LedgerGap | null {
  const result = verifyReceiptChain(receipts);
  if (result.passed || result.breakAtSeq === null) {
    return null;
  }
  return {
    breakAtSeq: result.breakAtSeq,
    reason: result.breakReason ?? 'Unknown chain break',
  };
}

export function closePackFileName(period: ClosePackPeriod): string {
  return `mastrion-close-${period.label}.json`;
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
