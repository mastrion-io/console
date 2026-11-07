#!/usr/bin/env bash
# scripts/verify.sh — the one gate. Nothing merges, nothing is demoed, until this exits 0.
#
# MST-OPS-005 / console #21. Before this file, "QA gate: tsc and next build both PASS" was a
# sentence in a commit message that nobody could re-run, and fe-agent's allowlist rejected the
# very directory a gate script has to live in. Four steps, in this order, each of which fails the
# whole gate:
#
#   1. typecheck  tsc --noEmit on tsconfig.qa.json   (the app tsconfig includes .next/types/**,
#                which a dev server rewrites as it compiles, so it is a false red on a green tree)
#   2. unit       node's test runner over src/**/*.test.ts via scripts/run-tests.js
#   3. build      next build in this checkout. Next rewrites tsconfig.json's include list as a
#                side effect, which is why the agent hard-denies tsconfig.json: step 1 runs before
#                step 3, and this script restores tsconfig.json afterwards so a gate run never
#                leaves a diff behind (that restore is the only file this script writes).
#   4. contract   the SSE proxy contract test on its own, printed by name, because that is the one
#                the demo stands on
#
# Usage: scripts/verify.sh [--fast]      --fast skips the build (steps 1, 2 and 4 only)
# Exit:  0 all steps passed, 1 the first failure (the step name is the last line printed)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

FAST=0
if [[ "${1:-}" == "--fast" ]]; then FAST=1; fi

step() { printf '\n== %s ==\n' "$1"; }
fail() { printf '\nGATE FAILED: %s\n' "$1" >&2; exit 1; }

step "1/4 typecheck (tsc --noEmit --project tsconfig.qa.json)"
npx tsc --noEmit --project tsconfig.qa.json || fail "typecheck"

step "2/4 unit tests (src/**/*.test.ts)"
node scripts/run-tests.js || fail "unit tests"

step "3/4 build (next build)"
if [[ "$FAST" -eq 1 ]]; then
  echo "skipped (--fast)"
else
  tsconfig_backup="$(mktemp)"
  cp tsconfig.json "$tsconfig_backup"
  NEXT_TELEMETRY_DISABLED=1 npm run build || { cp "$tsconfig_backup" tsconfig.json; fail "build"; }
  cp "$tsconfig_backup" tsconfig.json
  rm -f "$tsconfig_backup"
fi

step "4/4 SSE proxy contract (src/lib/live/events-route.test.ts)"
node scripts/run-tests.js events-route || fail "SSE proxy contract"

printf '\nGATE PASSED (%s)\n' "$( [[ "$FAST" -eq 1 ]] && echo fast || echo full )"
