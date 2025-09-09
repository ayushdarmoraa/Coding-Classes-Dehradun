# Copilot Guardrails (Incremental Edits, No Unnecessary Files)

Intent: Make the smallest, safest change that satisfies the spec. Extend existing code; do not duplicate, fork, or overwrite prior work.

---

## 0) Before you write code — context scan (must do)
- Search repo for relevant modules, types, and routes before creating new files.
- Look for existing symbols, schemas, helpers, and endpoints with: feature name, route path, model/type names.
- Open the last changed files for this feature and skim the patterns (logging, error codes, validation, response shape).
- Adhere to the current contract/spec (error codes, shapes, headers, debug gating) — do not change surfaces unless explicitly told.

## 1) Change policy (default = modify in place)
- If a file already owns this concern, edit that file.
  - Examples: same API route, same model, same helper domain (time/slots/booking).
- Only create a new file if ALL are true:
  - The functionality is a new, separable concern (clear module boundary).
  - No existing module fits without making it bloated.
  - You add a 1-line import or hook so the new file is actually used.
- If you propose a new file, first add a “Patch Plan” (see template) that lists why extending an existing file is worse.

## 2) Never overwrite or regress prior work
- Do not delete or replace existing logic unless the spec says so. Prefer additive, well-scoped edits.
- Preserve error codes, response shapes, headers, logging keys, and debug gating (NODE_ENV !== 'production').
- Keep public contracts stable; if you must change them, show a migration note in the Patch Plan.

## 3) File & symbol hygiene
- Reuse existing helpers (e.g., time/tz, grid alignment, validation, entitlements, logging).
- Keep naming consistent with the codebase (types, enums, error codes).
- No broad eslint-disable. If unavoidable, scope to one line with a reason.

## 4) Diff budget & safety
- Favor small, composable commits over large refactors.
- Do not move files or rename symbols unless required by the spec; if required, list the moves in the Patch Plan’s “Renames/Moves”.
- Maintain type safety; no any unless you narrow it immediately.

## 5) Tests, lint, and contracts
- Run typecheck + lint locally; fix all warnings in touched files.
- If you add behavior, add/extend minimal tests (unit or Playwright) tied to acceptance criteria.
- Keep determinism: no time or randomness without explicit control/injection.

## 6) Observability & perf
- Reuse structured logging keys already present (e.g., slots.*, booking.*).
- Don’t add heavy runtime dependencies; prefer existing utils.
- Watch hot paths (slot generation, availability): keep allocations low and loops linear in inputs.

---

## Patch Plan (must output before code)
- Goal: <one sentence of the change aligned to the spec>
- Touched files (modify in place):
  - path/fileA.ts — <what & why>
  - path/fileB.ts — <what & why>
- New files (only if necessary; justify):
  - path/newFile.ts — reason new module is required (cannot extend X because Y). How it’s wired (import location).
- No-change assertions:
  - Public API surfaces unchanged: <list endpoints/contracts you will not alter>
  - Error codes unchanged: <list>
  - Logging/debug gating preserved.
- Tests to add/adjust:
  - <very short list mapping to acceptance checks>
- Rollback plan:
  - Safe to revert commit without data migration; no schema changes.

## Pre-commit checklist (tick all)
- [ ] No duplicate modules/functions created; extended existing file(s) where appropriate.
- [ ] Error codes & response shapes unchanged (unless explicitly approved).
- [ ] Debug output is dev-only; no PII.
- [ ] Lint/typecheck clean; no stray eslint-disable.
- [ ] Minimal tests added/updated and passing.
- [ ] Commit message references the spec step and files touched.

## Commit message template

```
feat(<area>): <short goal> [Step <N>]

- Modify: path/fileA.ts — <what>
- Modify: path/fileB.ts — <what>
- (If any) New: path/newFile.ts — <why; how wired>

Contracts preserved: <list>
Tests: <short>
```

## If missing context or uncertainty arises
- Produce only the Patch Plan (no code) and ask for a go/no-go on file choices or contract changes.
