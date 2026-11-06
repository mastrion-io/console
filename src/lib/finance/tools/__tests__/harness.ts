export interface Expectation {
  toBe(expected: unknown): void;
  toContain(expected: string): void;
  toBeGreaterThan(expected: number): void;
}

export function expect(actual: unknown): Expectation {
  return {
    toBe(expected: unknown): void {
      if (actual !== expected) {
        throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
      }
    },
    toContain(expected: string): void {
      if (typeof actual !== 'string' || !actual.includes(expected)) {
        throw new Error(`Expected ${String(actual)} to contain ${expected}`);
      }
    },
    toBeGreaterThan(expected: number): void {
      if (typeof actual !== 'number' || !(actual > expected)) {
        throw new Error(`Expected ${String(actual)} to be greater than ${String(expected)}`);
      }
    },
  };
}

export function describe(name: string, fn: () => void): void {
  void name;
  fn();
}

export function it(name: string, fn: () => void): void {
  void name;
  fn();
}
