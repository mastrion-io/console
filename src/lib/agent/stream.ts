import type { StreamFrame } from './types';

export interface GapCheckResult {
  ok: boolean;
  expectedSeq: number;
  receivedSeq: number;
}

/**
 * Detects a sequence gap between the last accepted frame and the incoming
 * frame. A gap means the transport dropped at least one frame and the
 * transcript must not be presented as complete.
 */
export function detectGap(
  lastSeq: number,
  incoming: StreamFrame,
): GapCheckResult {
  const expectedSeq = lastSeq + 1;
  return {
    ok: incoming.seq === expectedSeq,
    expectedSeq,
    receivedSeq: incoming.seq,
  };
}
