import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { COMMITMENTS, summarizeCommitments } from './index';

// The /commitments page must not be able to drift from the claims it renders: a claim marked
// "proven" without a route, or a total that changed silently, would let the demo narrate
// something as live that has no proof behind it.

describe('commitments page data', () => {
  it('covers all seven LIVE & VERIFIABLE claims from DECISIONS.md', () => {
    assert.equal(COMMITMENTS.length, 7);
    assert.deepEqual(
      COMMITMENTS.map((c) => c.id),
      ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
    );
  });

  it('every claim marked proven names a route', () => {
    for (const c of COMMITMENTS.filter((x) => x.state === 'proven')) {
      assert.ok(c.proof && c.proof.startsWith('/'), `${c.id} is proven but has no route`);
    }
  });

  it('no claim without a route is marked proven', () => {
    for (const c of COMMITMENTS.filter((x) => !x.proof)) {
      assert.notEqual(c.state, 'proven', `${c.id} has no route but claims to be proven`);
    }
  });

  it('two claims are provable in the console today, five are not', () => {
    const counts = summarizeCommitments(COMMITMENTS);
    assert.equal(counts.total, 7);
    assert.equal(counts.proven, 2);
    assert.equal(counts.notProven, 5);
    assert.equal(counts.notBuilt, 2);
    assert.equal(counts.fixture, 1);
    assert.equal(counts.external, 2);
  });
});
