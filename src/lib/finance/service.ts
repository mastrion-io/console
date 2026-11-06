import {
  FIXTURE_AS_OF,
  budgets as fixtureBudgets,
  buildKpiSnapshot,
  costCenters as fixtureCostCenters,
  invoices as fixtureInvoices,
  modelRoutes as fixtureModelRoutes,
} from './fixtures';
import { readFinopsState } from './readers';
import type {
  Budget,
  CostCenter,
  FinanceEnvelope,
  FinanceSource,
  Invoice,
  KpiSnapshot,
  ModelRoute,
} from './types';

function envelope<T>(data: T, source: FinanceSource, asOf: string, degraded: boolean): FinanceEnvelope<T> {
  return { data, source, asOf, degraded };
}

export async function getKpis(): Promise<FinanceEnvelope<KpiSnapshot>> {
  const state = await readFinopsState();
  const snapshot = buildKpiSnapshot();
  if (state.degraded) {
    return envelope(snapshot, 'fixture', FIXTURE_AS_OF, true);
  }
  return envelope({ ...snapshot, source: state.source, asOf: state.asOf }, state.source, state.asOf, false);
}

export async function getCostCenters(): Promise<FinanceEnvelope<CostCenter[]>> {
  const state = await readFinopsState();
  if (state.degraded) {
    return envelope(fixtureCostCenters, 'fixture', FIXTURE_AS_OF, true);
  }
  return envelope(fixtureCostCenters, state.source, state.asOf, false);
}

export async function getCostCenter(id: string): Promise<FinanceEnvelope<CostCenter> | null> {
  const state = await readFinopsState();
  const found = fixtureCostCenters.find((cc) => cc.id === id);
  if (!found) {
    return null;
  }
  if (state.degraded) {
    return envelope(found, 'fixture', FIXTURE_AS_OF, true);
  }
  return envelope(found, state.source, state.asOf, false);
}

export async function getBudgets(): Promise<FinanceEnvelope<Budget[]>> {
  const state = await readFinopsState();
  if (state.degraded) {
    return envelope(fixtureBudgets, 'fixture', FIXTURE_AS_OF, true);
  }
  return envelope(fixtureBudgets, state.source, state.asOf, false);
}

export async function getInvoices(): Promise<FinanceEnvelope<Invoice[]>> {
  const state = await readFinopsState();
  if (state.degraded) {
    return envelope(fixtureInvoices, 'fixture', FIXTURE_AS_OF, true);
  }
  return envelope(fixtureInvoices, state.source, state.asOf, false);
}

export async function getModelRoutes(): Promise<FinanceEnvelope<ModelRoute[]>> {
  const state = await readFinopsState();
  if (state.degraded) {
    return envelope(fixtureModelRoutes, 'fixture', FIXTURE_AS_OF, true);
  }
  return envelope(fixtureModelRoutes, state.source, state.asOf, false);
}
