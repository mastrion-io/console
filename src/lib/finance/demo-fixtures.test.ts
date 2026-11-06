import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEMO_DATASET,
  sumCostCenterSpend,
  sumRouteSpend,
} from './demo-fixtures';

test('spend by cost center equals spend by route equals KPI total', () => {
  const byCostCenter = sumCostCenterSpend(DEMO_DATASET);
  const byRoute = sumRouteSpend(DEMO_DATASET);
  const kpiTotal = DEMO_DATASET.kpi.totalSpendEur;

  assert.equal(byCostCenter, byRoute);
  assert.equal(byRoute, kpiTotal);
  assert.equal(byCostCenter - kpiTotal, 0);
});

test('exactly one cost center is tripped at 118 percent', () => {
  const tripped = DEMO_DATASET.costCenters.filter((cc) => cc.tripped);
  assert.equal(tripped.length, 1);
  assert.equal(tripped[0].utilizationPct, 118);
});

test('invoices include one overdue and one disputed', () => {
  const overdue = DEMO_DATASET.invoices.filter((inv) => inv.status === 'overdue');
  const disputed = DEMO_DATASET.invoices.filter((inv) => inv.status === 'disputed');
  assert.equal(overdue.length, 1);
  assert.equal(disputed.length, 1);
});

test('month end projection is credible against MTD', () => {
  const { mtdSpendEur, projectedSpendEur, daysElapsed, daysInMonth } =
    DEMO_DATASET.projection;
  const runRate = (mtdSpendEur / daysElapsed) * daysInMonth;
  assert.ok(Math.abs(runRate - projectedSpendEur) < 1);
});
