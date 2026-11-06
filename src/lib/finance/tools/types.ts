export type ToolSource = 'fixture' | 'live';

export interface ToolEnvelope<T> {
  data: T;
  humanSummary: string;
  source: ToolSource;
  asOf: string;
}

export interface ToolError {
  error: string;
  hint: string;
  source: ToolSource;
  asOf: string;
}

export type ToolResult<T> = ToolEnvelope<T> | ToolError;

export function isToolError<T>(result: ToolResult<T>): result is ToolError {
  return typeof (result as ToolError).error === 'string';
}

export const FIXTURE_SOURCE: ToolSource = 'fixture';

export function nowIso(): string {
  return new Date().toISOString();
}

export function errorResult(message: string, hint: string): ToolError {
  return { error: message, hint, source: FIXTURE_SOURCE, asOf: nowIso() };
}
