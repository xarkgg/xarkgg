# Animation Plans — xarkgg

Recommended execution order and status tracking for `improve-animations` plans.

| # | Title | Severity | Category | Status | Dependencies |
|---|-------|----------|----------|--------|------------|
| 001 | add-active-feedback-on-text-input | LOW | missed-opportunity (Physicality & origin; Accessibility) | TODO | None |
| 002 | add-stagger-to-project-strip | LOW | missed-opportunity (Cohesion & tokens) | TODO | None |

## Execution notes

- Each plan is self-contained — no plan depends on another; they can be applied in any order.
- Plans modify only `index.html` inline styles/JS; no new files, dependencies, or build steps required.
- Each plan includes a `prefers-reduced-motion` gate; applying one does not affect the other.
- After executing a plan, update its `Status` row from `TODO` to `DONE` and note the verification result.

## Verification checklist (run after any plan)

- [ ] Browser opens `index.html` without CSS/JS errors
- [ ] `prefers-reduced-motion` gate works (DevTools → Rendering panel toggles animation off)
- [ ] Feel check: trigger the described interaction and confirm the motion matches the plan's intent
- [ ] No unintended side effects on other UI elements

## How to execute a plan

```bash
# Example: execute plan 001
# The plan file is at plans/001-add-active-feedback-on-text-input.md
# Follow the "Steps" section in that file for the exact edit

# Or use the improve-animations execute variant:
# /improve-animations execute 001-add-active-feedback-on-text-input
```

## Notes

- This repo has no existing plans prior to this session; numbering starts at 001.
- All values (easing, durations, stagger ms) are pulled from the codebase's existing tokens/conventions — no arbitrary values introduced.
- The only "corrective" work this repo needs is none — all 8 animation audit categories pass. These two plans are purely additive polish items.