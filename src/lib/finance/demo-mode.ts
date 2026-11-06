import { DEMO_DATASET, isDemoMode, type FinanceDemoDataset } from './demo-fixtures';

export interface FinanceDataResult {
  data: FinanceDemoDataset;
  demo: boolean;
  source: 'fixture' | 'live';
}

/**
 * Single entry point for finance data. In demo mode no network call is
 * attempted at all; the seeded fixture is returned synchronously.
 */
export async function loadFinanceData(): Promise<FinanceDataResult> {
  if (isDemoMode()) {
    return { data: DEMO_DATASET, demo: true, source: 'fixture' };
  }

  return { data: DEMO_DATASET, demo: false, source: 'fixture' };
}
