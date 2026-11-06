import { createHash, randomUUID } from 'crypto';

export type WriteToolName =
  | 'set_budget_cap'
  | 'tag_cost_center'
  | 'export_close_pack'
  | 'open_invoice_dispute';

export interface ConfirmationRecord {
  confirmationId: string;
  tool: WriteToolName;
  issuedAt: number;
  expiresAt: number;
  consumed: boolean;
  argumentHash: string;
}

export interface LedgerEntry {
  id: string;
  tool: WriteToolName;
  actor: string;
  argumentHash: string;
  redactedSummary: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  confirmationId: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface DryRunResult {
  ok: boolean;
  tool: WriteToolName;
  intendedEffect: string;
  validation: ValidationIssue[];
  blastRadius?: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  confirmationId?: string;
}

export interface ConfirmedResult {
  ok: boolean;
  tool: WriteToolName;
  applied: boolean;
  idempotentReplay: boolean;
  ledgerEntry?: LedgerEntry;
  error?: string;
}

export interface PolicyContext {
  writesThisTurn: number;
}

export const BUDGET_CAP_CEILING_CENTS = 5_000_000;
export const MIN_REASON_LENGTH = 10;
export const CONFIRMATION_TTL_MS = 5 * 60 * 1000;

export interface CostCenterRecord {
  costCenter: string;
  dailyCapCents: number;
}

export interface EntityRecord {
  entityId: string;
  kind: 'invoice' | 'spend_bucket';
  costCenter: string;
  status: 'open' | 'paid' | 'disputed' | 'closed';
  netCents: number;
}

export interface InvoiceRecord {
  invoiceId: string;
  status: 'open' | 'paid' | 'disputed' | 'closed';
  netCents: number;
  disputeReason?: string;
}

export interface WriteToolStore {
  costCenters: Map<string, CostCenterRecord>;
  entities: Map<string, EntityRecord>;
  invoices: Map<string, InvoiceRecord>;
  confirmations: Map<string, ConfirmationRecord>;
  ledger: LedgerEntry[];
  appliedIdempotencyKeys: Set<string>;
}

export function createWriteToolStore(): WriteToolStore {
  return {
    costCenters: new Map(),
    entities: new Map(),
    invoices: new Map(),
    confirmations: new Map(),
    ledger: [],
    appliedIdempotencyKeys: new Set(),
  };
}

export function hashArguments(args: Record<string, unknown>): string {
  const canonical = JSON.stringify(args, Object.keys(args).sort());
  return createHash('sha256').update(canonical).digest('hex');
}

export function deriveIdempotencyKey(confirmationId: string): string {
  return createHash('sha256').update(`idem:${confirmationId}`).digest('hex');
}

export function redactSummary(tool: WriteToolName, args: Record<string, unknown>): string {
  switch (tool) {
    case 'set_budget_cap':
      return `Set daily cap for cost center ${String(args.costCenter)} to ${String(args.dailyCapCents)} cents`;
    case 'tag_cost_center':
      return `Retag entity ${String(args.entityId)} to cost center ${String(args.costCenter)}`;
    case 'export_close_pack':
      return `Export close pack ${String(args.periodStart)} to ${String(args.periodEnd)}`;
    case 'open_invoice_dispute':
      return `Open dispute on invoice ${String(args.invoiceId)}`;
  }
}

export function enforceSingleWritePerTurn(ctx: PolicyContext): string | null {
  if (ctx.writesThisTurn >= 1) {
    return 'Policy violation: only one write tool may be invoked per turn. A human must review the previous write before another can be proposed.';
  }
  return null;
}

export function issueConfirmation(
  store: WriteToolStore,
  tool: WriteToolName,
  args: Record<string, unknown>,
): ConfirmationRecord {
  const now = Date.now();
  const record: ConfirmationRecord = {
    confirmationId: randomUUID(),
    tool,
    issuedAt: now,
    expiresAt: now + CONFIRMATION_TTL_MS,
    consumed: false,
    argumentHash: hashArguments(args),
  };
  store.confirmations.set(record.confirmationId, record);
  return record;
}

export function validateConfirmation(
  store: WriteToolStore,
  confirmationId: string,
  tool: WriteToolName,
  args: Record<string, unknown>,
): string | null {
  const record = store.confirmations.get(confirmationId);
  if (!record) return 'Unknown confirmation id.';
  if (record.tool !== tool) return 'Confirmation id does not match tool.';
  if (record.consumed) return 'Confirmation id already consumed.';
  if (Date.now() > record.expiresAt) return 'Confirmation id expired.';
  if (record.argumentHash !== hashArguments(args)) return 'Confirmation id does not match arguments.';
  return null;
}

export function appendLedger(
  store: WriteToolStore,
  entry: Omit<LedgerEntry, 'id' | 'createdAt'>,
): LedgerEntry {
  const full: LedgerEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.ledger.push(full);
  return full;
}

export interface SetBudgetCapArgs {
  costCenter: string;
  dailyCapCents: number;
  reason: string;
}

export function dryRunSetBudgetCap(store: WriteToolStore, args: SetBudgetCapArgs): DryRunResult {
  const validation: ValidationIssue[] = [];
  if (!args.reason || args.reason.trim().length < MIN_REASON_LENGTH) {
    validation.push({ field: 'reason', message: `Reason must be at least ${MIN_REASON_LENGTH} characters.` });
  }
  if (!Number.isFinite(args.dailyCapCents) || args.dailyCapCents <= 0) {
    validation.push({ field: 'dailyCapCents', message: 'Daily cap must be a positive integer.' });
  } else if (args.dailyCapCents > BUDGET_CAP_CEILING_CENTS) {
    validation.push({
      field: 'dailyCapCents',
      message: `Daily cap ${args.dailyCapCents} exceeds ceiling ${BUDGET_CAP_CEILING_CENTS}. Ask the operator for a lower value.`,
    });
  }
  const existing = store.costCenters.get(args.costCenter);
  const before = existing ? { dailyCapCents: existing.dailyCapCents } : null;
  const after = { dailyCapCents: args.dailyCapCents };
  const ok = validation.length === 0;
  return {
    ok,
    tool: 'set_budget_cap',
    intendedEffect: `Set daily cap for ${args.costCenter} to ${args.dailyCapCents} cents`,
    validation,
    blastRadius: 'Requests above this cap reroute to local sovereign models at zero marginal cost.',
    before,
    after,
    confirmationId: ok ? issueConfirmation(store, 'set_budget_cap', args as unknown as Record<string, unknown>).confirmationId : undefined,
  };
}

export function confirmSetBudgetCap(
  store: WriteToolStore,
  args: SetBudgetCapArgs,
  confirmationId: string,
  actor: string,
): ConfirmedResult {
  const err = validateConfirmation(store, confirmationId, 'set_budget_cap', args as unknown as Record<string, unknown>);
  if (err) return { ok: false, tool: 'set_budget_cap', applied: false, idempotentReplay: false, error: err };
  const idem = deriveIdempotencyKey(confirmationId);
  if (store.appliedIdempotencyKeys.has(idem)) {
    return { ok: true, tool: 'set_budget_cap', applied: false, idempotentReplay: true };
  }
  const existing = store.costCenters.get(args.costCenter);
  const before = existing ? { dailyCapCents: existing.dailyCapCents } : null;
  store.costCenters.set(args.costCenter, { costCenter: args.costCenter, dailyCapCents: args.dailyCapCents });
  const after = { dailyCapCents: args.dailyCapCents };
  const entry = appendLedger(store, {
    tool: 'set_budget_cap',
    actor,
    argumentHash: hashArguments(args as unknown as Record<string, unknown>),
    redactedSummary: redactSummary('set_budget_cap', args as unknown as Record<string, unknown>),
    before,
    after,
    confirmationId,
    idempotencyKey: idem,
  });
  store.appliedIdempotencyKeys.add(idem);
  const rec = store.confirmations.get(confirmationId);
  if (rec) rec.consumed = true;
  return { ok: true, tool: 'set_budget_cap', applied: true, idempotentReplay: false, ledgerEntry: entry };
}

export interface TagCostCenterArgs {
  entityId: string;
  costCenter: string;
  reason: string;
}

export function dryRunTagCostCenter(store: WriteToolStore, args: TagCostCenterArgs): DryRunResult {
  const validation: ValidationIssue[] = [];
  if (!args.reason || args.reason.trim().length < MIN_REASON_LENGTH) {
    validation.push({ field: 'reason', message: `Reason must be at least ${MIN_REASON_LENGTH} characters.` });
  }
  const entity = store.entities.get(args.entityId);
  if (!entity) {
    validation.push({ field: 'entityId', message: `Unknown entity ${args.entityId}.` });
  }
  const before = entity ? { costCenter: entity.costCenter } : null;
  const after = { costCenter: args.costCenter };
  const ok = validation.length === 0;
  return {
    ok,
    tool: 'tag_cost_center',
    intendedEffect: `Retag ${args.entityId} from ${entity?.costCenter ?? 'unknown'} to ${args.costCenter}`,
    validation,
    before,
    after,
    confirmationId: ok ? issueConfirmation(store, 'tag_cost_center', args as unknown as Record<string, unknown>).confirmationId : undefined,
  };
}

export function confirmTagCostCenter(
  store: WriteToolStore,
  args: TagCostCenterArgs,
  confirmationId: string,
  actor: string,
): ConfirmedResult {
  const err = validateConfirmation(store, confirmationId, 'tag_cost_center', args as unknown as Record<string, unknown>);
  if (err) return { ok: false, tool: 'tag_cost_center', applied: false, idempotentReplay: false, error: err };
  const idem = deriveIdempotencyKey(confirmationId);
  if (store.appliedIdempotencyKeys.has(idem)) {
    return { ok: true, tool: 'tag_cost_center', applied: false, idempotentReplay: true };
  }
  const entity = store.entities.get(args.entityId);
  if (!entity) return { ok: false, tool: 'tag_cost_center', applied: false, idempotentReplay: false, error: 'Unknown entity.' };
  const before = { costCenter: entity.costCenter };
  entity.costCenter = args.costCenter;
  const after = { costCenter: entity.costCenter };
  const entry = appendLedger(store, {
    tool: 'tag_cost_center',
    actor,
    argumentHash: hashArguments(args as unknown as Record<string, unknown>),
    redactedSummary: redactSummary('tag_cost_center', args as unknown as Record<string, unknown>),
    before,
    after,
    confirmationId,
    idempotencyKey: idem,
  });
  store.appliedIdempotencyKeys.add(idem);
  const rec = store.confirmations.get(confirmationId);
  if (rec) rec.consumed = true;
  return { ok: true, tool: 'tag_cost_center', applied: true, idempotentReplay: false, ledgerEntry: entry };
}

export interface ExportClosePackArgs {
  periodStart: string;
  periodEnd: string;
}

export function dryRunExportClosePack(store: WriteToolStore, args: ExportClosePackArgs): DryRunResult {
  const validation: ValidationIssue[] = [];
  if (!args.periodStart || !args.periodEnd) {
    validation.push({ field: 'period', message: 'Both periodStart and periodEnd are required.' });
  } else if (args.periodStart > args.periodEnd) {
    validation.push({ field: 'period', message: 'periodStart must be before periodEnd.' });
  }
  const ok = validation.length === 0;
  return {
    ok,
    tool: 'export_close_pack',
    intendedEffect: `Export close pack ${args.periodStart} to ${args.periodEnd}. No money moves; recorded for audit only.`,
    validation,
    before: null,
    after: { downloadId: 'pending' },
    confirmationId: ok ? issueConfirmation(store, 'export_close_pack', args as unknown as Record<string, unknown>).confirmationId : undefined,
  };
}

export function confirmExportClosePack(
  store: WriteToolStore,
  args: ExportClosePackArgs,
  confirmationId: string,
  actor: string,
): ConfirmedResult {
  const err = validateConfirmation(store, confirmationId, 'export_close_pack', args as unknown as Record<string, unknown>);
  if (err) return { ok: false, tool: 'export_close_pack', applied: false, idempotentReplay: false, error: err };
  const idem = deriveIdempotencyKey(confirmationId);
  if (store.appliedIdempotencyKeys.has(idem)) {
    return { ok: true, tool: 'export_close_pack', applied: false, idempotentReplay: true };
  }
  const downloadId = `dl_${randomUUID()}`;
  const entry = appendLedger(store, {
    tool: 'export_close_pack',
    actor,
    argumentHash: hashArguments(args as unknown as Record<string, unknown>),
    redactedSummary: redactSummary('export_close_pack', args as unknown as Record<string, unknown>),
    before: null,
    after: { downloadId },
    confirmationId,
    idempotencyKey: idem,
  });
  store.appliedIdempotencyKeys.add(idem);
  const rec = store.confirmations.get(confirmationId);
  if (rec) rec.consumed = true;
  return { ok: true, tool: 'export_close_pack', applied: true, idempotentReplay: false, ledgerEntry: entry };
}

export interface OpenInvoiceDisputeArgs {
  invoiceId: string;
  reason: string;
  expectedNetCents?: number;
}

export function dryRunOpenInvoiceDispute(store: WriteToolStore, args: OpenInvoiceDisputeArgs): DryRunResult {
  const validation: ValidationIssue[] = [];
  if (!args.reason || args.reason.trim().length < MIN_REASON_LENGTH) {
    validation.push({ field: 'reason', message: `Reason must be at least ${MIN_REASON_LENGTH} characters.` });
  }
  const invoice = store.invoices.get(args.invoiceId);
  if (!invoice) {
    validation.push({ field: 'invoiceId', message: `Unknown invoice ${args.invoiceId}.` });
  } else if (invoice.status === 'paid') {
    validation.push({ field: 'invoiceId', message: 'Cannot dispute an invoice that is already paid.' });
  }
  if (args.expectedNetCents !== undefined && invoice && invoice.netCents !== args.expectedNetCents) {
    validation.push({ field: 'expectedNetCents', message: 'Expected net does not match invoice net.' });
  }
  const before = invoice ? { status: invoice.status } : null;
  const after = { status: 'disputed' as const };
  const ok = validation.length === 0;
  return {
    ok,
    tool: 'open_invoice_dispute',
    intendedEffect: `Set invoice ${args.invoiceId} to disputed`,
    validation,
    before,
    after,
    confirmationId: ok ? issueConfirmation(store, 'open_invoice_dispute', args as unknown as Record<string, unknown>).confirmationId : undefined,
  };
}

export function confirmOpenInvoiceDispute(
  store: WriteToolStore,
  args: OpenInvoiceDisputeArgs,
  confirmationId: string,
  actor: string,
): ConfirmedResult {
  const err = validateConfirmation(store, confirmationId, 'open_invoice_dispute', args as unknown as Record<string, unknown>);
  if (err) return { ok: false, tool: 'open_invoice_dispute', applied: false, idempotentReplay: false, error: err };
  const idem = deriveIdempotencyKey(confirmationId);
  if (store.appliedIdempotencyKeys.has(idem)) {
    return { ok: true, tool: 'open_invoice_dispute', applied: false, idempotentReplay: true };
  }
  const invoice = store.invoices.get(args.invoiceId);
  if (!invoice) return { ok: false, tool: 'open_invoice_dispute', applied: false, idempotentReplay: false, error: 'Unknown invoice.' };
  if (invoice.status === 'paid') return { ok: false, tool: 'open_invoice_dispute', applied: false, idempotentReplay: false, error: 'Cannot dispute a paid invoice.' };
  const before = { status: invoice.status };
  invoice.status = 'disputed';
  invoice.disputeReason = args.reason;
  const after = { status: invoice.status, disputeReason: invoice.disputeReason };
  const entry = appendLedger(store, {
    tool: 'open_invoice_dispute',
    actor,
    argumentHash: hashArguments(args as unknown as Record<string, unknown>),
    redactedSummary: redactSummary('open_invoice_dispute', args as unknown as Record<string, unknown>),
    before,
    after,
    confirmationId,
    idempotencyKey: idem,
  });
  store.appliedIdempotencyKeys.add(idem);
  const rec = store.confirmations.get(confirmationId);
  if (rec) rec.consumed = true;
  return { ok: true, tool: 'open_invoice_dispute', applied: true, idempotentReplay: false, ledgerEntry: entry };
}
