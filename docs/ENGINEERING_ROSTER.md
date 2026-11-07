# Engineering roster and claim protocol

Who owns what, which of them can actually write code, and how a ticket moves. The source of truth
is `ENGINEERING_ROSTER.md` in `mastrion-io/mastrion-core/docs`; this is the console side of it plus
the corrections learned between 2026-11-06 and 2026-11-07 (console #22, [MST-OPS-006]).

## The distinction that matters

A **persona** is a name and a set of labels. A **runtime** is a process that calls a model, writes
files, runs a gate and commits. Four personas once had no runtime and their cycles logged
busy-looking work while producing nothing.

| Persona | Label | Runtime | Writes |
| :--- | :--- | :--- | :--- |
| **Tolu** (PM) | `mastrion-pm` | `mastrion_team_swarm.py` | nothing. Files, scopes and hands off tickets |
| **Jide** (Systems) | `role:engineer-systems` | `bin/mastrion_team_swarm_real.py` | Go in `mastrion-io/mastrion-core` |
| **fe-agent** (Frontend) | `role:engineer-frontend` | `bin/mastrion_fe_agent.py` | TypeScript in `mastrion-io/console` |
| **Chidi** (QA) | `role:qa` | both runtimes' gate | nothing. Verifies, then closes |

`role:engineer-apps`, `role:engineer-finops` and `role:engineer-agent` are **domain labels with no
owning process**. They describe what a ticket is about; nothing polls them.

## Claim protocol

1. Take a ticket only if it is `status:backlog` **and** carries the label of the agent that owns
   the language. A console ticket is TypeScript; a Go swarm claiming it is the 2026-11-06 failure.
2. Claim by swapping `status:backlog` -> `status:in-dev` in the same `gh issue edit` call that
   comments the claim, so the board never shows two claims on one ticket.
3. **WIP limit: one ticket per agent.** A second instance of a runtime exits on its pid lock
   (`state/fe-agent.lock`, `state/swarm-real.lock`). Two agents on one checkout fight over
   `git reset --hard`; that cost four hours of delivery on 2026-11-06.
4. A closed ticket is not evidence. Close only after a commit SHA exists on the remote **and** the
   gate output from `scripts/verify.sh` is pasted into the ticket.

## Gate

`scripts/verify.sh` is the gate. That sentence used to be a claim in a commit message; from
2026-11-07 it is a file anyone can run:

- step 1 `tsc --noEmit --project tsconfig.qa.json`
- step 2 `node scripts/run-tests.js` (every `src/**/*.test.ts`)
- step 3 `MASTRION_DIST_DIR=.next-qa npm run build`
- step 4 the SSE proxy contract test on its own, because the demo stands on it

`--fast` skips the build. **A gate claim in a comment without a pasted `GATE PASSED` line is not a
gate claim.**

## File scope (the reason for three rejected cycles)

`mastrion_fe_agent.py` writes only inside `src/` and rejects a cycle whose `git status` shows
anything else. A gate script has to live in `scripts/`, and repo-root `state/` is where the
runtimes keep their locks and logs, so:

- **allowed:** `src/**`, `scripts/**`, repo-root `state/**`
- **never:** `next.config.js`, `tsconfig.json`, `package.json`, `package-lock.json`, `.gitignore`
  (the agent must not be able to edit the gate that judges it)

A rejection that reads `Wrote outside src/: ['scripts/', 'state/']` is a **scope-rule bug**, not a
logic failure, and must not be reported as "the guardrails did not work".
