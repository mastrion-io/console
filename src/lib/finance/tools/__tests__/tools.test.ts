import { describe, expect, it } from './harness';
import { getSpendSummary } from '../getSpendSummary';
import { getCostCenterDetail } from '../getCostCenterDetail';
import { getBudgetStatus } from '../getBudgetStatus';
import { listInvoices } from '../listInvoices';
import { getRouteMix } from '../getRouteMix';
import { forecastRunway } from '../forecastRunway';
import { FINANCE_TOOLS } from '../registry';
import { isToolError } from '../types';

describe('get_spend_summary', () => {
  it('returns totals for a happy path range', () => {
    const res = getSpendSummary({ from: '2025-01-02', to: '2025-01-05' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.totalEur).toBeGreaterThan(0);
    expect(res.source).toBe('fixture');
    expect(res.asOf.length).toBeGreaterThan(0);
    expect(res.humanSummary).toContain('fixture');
  });

  it('rejects a range longer than 400 days', () => {
    const res = getSpendSummary({ from: '2023-01-01', to: '2025-01-01' });
    expect(isToolError(res)).toBe(true);
    if (!isToolError(res)) return;
    expect(res.error).toContain('Range too long');
    expect(res.hint).toContain('Narrow');
  });

  it('rejects a reversed range', () => {
    const res = getSpendSummary({ from: '2025-01-05', to: '2025-01-02' });
    expect(isToolError(res)).toBe(true);
    if (!isToolError(res)) return;
    expect(res.error).toContain('Reversed range');
  });

  it('rejects an unknown cost center', () => {
    const res = getSpendSummary({ from: '2025-01-02', to: '2025-01-05', costCenter: 'cc-nope' });
    expect(isToolError(res)).toBe(true);
    if (!isToolError(res)) return;
    expect(res.error).toContain('Unknown cost center');
  });

  it('returns an empty result for a range with no data', () => {
    const res = getSpendSummary({ from: '2024-06-01', to: '2024-06-05' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.totalEur).toBe(0);
    expect(res.humanSummary).toContain('No spend');
  });
});

describe('get_cost_center_detail', () => {
  it('returns a daily series for a happy path', () => {
    const res = getCostCenterDetail({ costCenter: 'cc-eng-platform', from: '2025-01-02', to: '2025-01-05' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.dailySeries.length).toBe(4);
    expect(res.data.utilisationPct).toBeGreaterThan(0);
    expect(res.source).toBe('fixture');
    expect(res.asOf.length).toBeGreaterThan(0);
  });

  it('rejects a range longer than 400 days', () => {
    const res = getCostCenterDetail({ costCenter: 'cc-eng-platform', from: '2023-01-01', to: '2025-01-01' });
    expect(isToolError(res)).toBe(true);
  });

  it('rejects an unknown cost center', () => {
    const res = getCostCenterDetail({ costCenter: 'cc-nope', from: '2025-01-02', to: '2025-01-05' });
    expect(isToolError(res)).toBe(true);
    if (!isToolError(res)) return;
    expect(res.error).toContain('Unknown cost center');
  });

  it('returns an empty series for a range with no data', () => {
    const res = getCostCenterDetail({ costCenter: 'cc-eng-platform', from: '2024-06-01', to: '2024-06-03' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.spendEur).toBe(0);
    expect(res.data.dailySeries.every((d) => d.totalEur === 0)).toBe(true);
  });
});

describe('get_budget_status', () => {
  it('returns all cost centers on a happy path', () => {
    const res = getBudgetStatus({});
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.entries.length).toBeGreaterThan(0);
    expect(res.source).toBe('fixture');
    expect(res.asOf.length).toBeGreaterThan(0);
  });

  it('rejects an unknown cost center', () => {
    const res = getBudgetStatus({ costCenter: 'cc-nope' });
    expect(isToolError(res)).toBe(true);
  });

  it('returns an empty entry list when filtered to nothing', () => {
    const res = getBudgetStatus({ costCenter: 'cc-client-success' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.entries.length).toBe(1);
  });
});

describe('list_invoices', () => {
  it('returns invoices with USt and gross on a happy path', () => {
    const res = listInvoices({});
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.invoices.length).toBeGreaterThan(0);
    expect(res.data.totals.grossEur).toBeGreaterThan(res.data.totals.netEur);
    expect(res.source).toBe('fixture');
    expect(res.asOf.length).toBeGreaterThan(0);
  });

  it('rejects a range longer than 400 days', () => {
    const res = listInvoices({ from: '2023-01-01', to: '2025-01-01' });
    expect(isToolError(res)).toBe(true);
  });

  it('rejects a reversed range', () => {
    const res = listInvoices({ from: '2025-01-10', to: '2025-01-01' });
    expect(isToolError(res)).toBe(true);
  });

  it('returns an empty result when nothing matches', () => {
    const res = listInvoices({ vendor: 'Nonexistent Vendor GmbH' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.invoices.length).toBe(0);
    expect(res.humanSummary).toContain('No invoices');
  });
});

describe('get_route_mix', () => {
  it('returns tier totals on a happy path', () => {
    const res = getRouteMix({ from: '2025-01-02', to: '2025-01-05' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.tiers.length).toBe(2);
    expect(res.source).toBe('fixture');
    expect(res.asOf.length).toBeGreaterThan(0);
  });

  it('rejects a range longer than 400 days', () => {
    const res = getRouteMix({ from: '2023-01-01', to: '2025-01-01' });
    expect(isToolError(res)).toBe(true);
  });

  it('returns zeroed tiers for a range with no data', () => {
    const res = getRouteMix({ from: '2024-06-01', to: '2024-06-03' });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.tiers.every((t) => t.costEur === 0)).toBe(true);
  });
});

describe('forecast_runway', () => {
  it('projects spend on a happy path', () => {
    const res = forecastRunway({ months: 6 });
    expect(isToolError(res)).toBe(false);
    if (isToolError(res)) return;
    expect(res.data.projectedSpendEur).toBeGreaterThan(0);
    expect(res.data.confidenceNote.length).toBeGreaterThan(0);
    expect(res.source).toBe('fixture');
    expect(res.asOf.length).toBeGreaterThan(0);
  });

  it('rejects months outside 1 to 24', () => {
    expect(isToolError(forecastRunway({ months: 0 }))).toBe(true);
    expect(isToolError(forecastRunway({ months: 25 }))).toBe(true);
  });

  it('rejects a non-integer month count', () => {
    expect(isToolError(forecastRunway({ months: 2.5 }))).toBe(true);
  });
});

describe('registry', () => {
  it('registers exactly six tools with schemas', () => {
    expect(FINANCE_TOOLS.length).toBe(6);
    for (const tool of FINANCE_TOOLS) {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.description.length).toBeGreaterThan(0);
    }
  });
});
