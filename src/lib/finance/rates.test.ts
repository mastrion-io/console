import {
  RATES,
  buildRouteLedgerRow,
  calculateBreakEven,
  annualiseSaving,
  type ModelRoute,
} from './rates';

interface TestCase {
  name: string;
  run: () => void;
}

const cases: TestCase[] = [];

function describe(name: string, fn: () => void): void {
  void name;
  fn();
}

function it(name: string, fn: () => void): void {
  cases.push({ name, run: fn });
}

function expect(actual: number): {
  toBe: (expected: number) => void;
  toBeCloseTo: (expected: number, digits?: number) => void;
} {
  return {
    toBe: (expected: number) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but received ${actual}`);
      }
    },
    toBeCloseTo: (expected: number, digits = 2) => {
      const tolerance = Math.pow(10, -digits) / 2;
      if (Math.abs(actual - expected) > tolerance) {
        throw new Error(
          `Expected ${actual} to be close to ${expected} (${digits} digits)`,
        );
      }
    },
  };
}

describe('savings equals tokens times rate difference', () => {
  const routes: ModelRoute[] = [
    {
      id: 'r-sovereign',
      name: 'Sovereign Llama 70B',
      tier: 'sovereign',
      tokensIn: 1_000_000,
      tokensOut: 0,
    },
    {
      id: 'r-hybrid',
      name: 'Hybrid Router',
      tier: 'hybrid',
      tokensIn: 500_000,
      tokensOut: 0,
    },
    {
      id: 'r-frontier',
      name: 'Frontier GPT-class',
      tier: 'frontier',
      tokensIn: 250_000,
      tokensOut: 0,
    },
  ];

  it('sovereign route saves full frontier cost', () => {
    const row = buildRouteLedgerRow(routes[0], RATES);
    const expected = (1_000_000 / 1000) * RATES.frontierRatePer1k;
    expect(row.saving).toBeCloseTo(expected, 6);
  });

  it('hybrid route saves nothing because it bills at frontier rate', () => {
    const row = buildRouteLedgerRow(routes[1], RATES);
    expect(row.saving).toBeCloseTo(0, 6);
  });

  it('frontier route saves nothing', () => {
    const row = buildRouteLedgerRow(routes[2], RATES);
    expect(row.saving).toBeCloseTo(0, 6);
  });
});

describe('zero traffic routes', () => {
  it('marks a route with zero tokens in as no traffic and zero saving', () => {
    const row = buildRouteLedgerRow(
      {
        id: 'r-idle',
        name: 'Idle Sovereign',
        tier: 'sovereign',
        tokensIn: 0,
        tokensOut: 0,
      },
      RATES,
    );
    expect(row.noTraffic ? 1 : 0).toBe(1);
    expect(row.saving).toBe(0);
    expect(row.costIncurred).toBe(0);
  });
});

describe('annualisation', () => {
  it('scales month-to-date by elapsed days', () => {
    const annual = annualiseSaving(100, 10);
    expect(annual).toBeCloseTo(3650, 6);
  });
});

describe('break-even calculator', () => {
  const input = {
    frontierRatePer1k: 0.024,
    sovereignMonthlyCost: 2400,
  };

  it('reports below crossover', () => {
    const result = calculateBreakEven({
      ...input,
      tokensPerMonth: 50_000_000,
    });
    expect(result.pastCrossover ? 1 : 0).toBe(0);
  });

  it('reports at crossover', () => {
    const result = calculateBreakEven({
      ...input,
      tokensPerMonth: 100_000_000,
    });
    expect(result.pastCrossover ? 1 : 0).toBe(1);
    expect(result.crossoverTokens).toBeCloseTo(100_000_000, 0);
  });

  it('reports above crossover', () => {
    const result = calculateBreakEven({
      ...input,
      tokensPerMonth: 200_000_000,
    });
    expect(result.pastCrossover ? 1 : 0).toBe(1);
    expect(result.netSaving).toBeCloseTo(2400, 6);
  });
});

// Minimal self-contained runner so the suite type-checks without a test runner.
for (const testCase of cases) {
  testCase.run();
}
