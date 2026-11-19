# Animation Plans — xarkgg

Plans from an `improve-animations` audit of the current build (commit
`d748cfb`). The site is a single file — `index.html` with inline CSS and JS —
so every plan is a CSS/JS edit in that file. No build step, no dependencies.

| # | Title | Severity | Status | Depends on |
|---|-------|----------|--------|------------|
| 001 | Chip entrance fill-mode and stagger | MEDIUM | DONE | — |
| 002 | Stagger project cards | LOW | ALREADY PRESENT | — |
| 003 | Tighten the desktop profile expand | MEDIUM | DONE | — |
| 004 | Morph the avatar into the profile photo | LOW | DONE | — |
| 005 | Hover feedback for cards and rows | LOW | DONE | — |

Plan 002 was written on a false premise and was withdrawn: the project cards
already carry a `nth-child` stagger at `index.html:102-107`
(50/100/150/200/250ms, then 300ms from the seventh card). A duplicate set of
delays was applied and then removed — the existing block is the better one.

## Execution order

1. **001** first — it fixes a real defect (the chips' press scale never
   renders because the entrance uses `both`), so it is the highest leverage.
2. **003** second — the most noticeable improvement to how the site feels on
   desktop.
3. **004** and **005** in any order — additive, independent of the others.

No plan conflicts with another: 001 and 002 touch different selectors, 003
touches desktop-only rules, 004 touches one JS function, 005 adds one gated
media block.

## Verification after any plan

- [ ] Page loads with a clean console at 390px and 1280px
- [ ] No horizontal overflow at 320 / 390 / 768 / 1280 / 1600
- [ ] `prefers-reduced-motion` still drops movement and keeps feedback
- [ ] Feel check from the plan, at 10% playback in the Animations panel
- [ ] Update the plan's `Status` to DONE

## Report-only findings (no plan)

These were confirmed in the audit but sit below the top five by leverage. Fix
them only if they start to annoy.

- **`index.html:116` + `hintRow` (`index.html:760`)** — `.row.tug` shakes the
  project strip for `1.1s` to hint that it scrolls horizontally, and re-fires
  every time the Projects chip is used, not just once. A once-per-session nudge
  or a shorter 0.7s would be enough. Rejected as a plan: it is a hint on
  functional content, and removing it entirely is also defensible.
- **`index.html:379-387`** — the seasonal easter egg (`?season=halloween`)
  animates 9 drips plus 5 drops inside a container with an SVG
  `filter:url(#xgoo)` (`feGaussianBlur` + `feColorMatrix`), and Christmas adds
  22 flakes each with `filter:drop-shadow(0 0 3px …)`. Both filters re-render
  every frame. Only active behind a URL parameter, which is why it is not in
  the top five; if it ever ships by default, drop the two filters and cap the
  counts first.

## Retired

Two plans from an earlier session (`001-add-active-feedback-on-text-input`,
`002-add-stagger-to-project-strip`) were written against a GSAP-era build that
no longer exists — `.strip`/`.polaroid` selectors, `--shadow`, `.send-btn`,
`.chat-header`, and a `gsap.from()` call are all gone (`gsap` appears zero
times in the current file). They were removed rather than left as TODO:

- The text-input press-scale plan is dropped as a judgement call: scaling the
  message field on tap is not standard, and the field is hit far more often
  than the elements that rule was meant to match.
- The project-strip stagger survives as **002**, rewritten against the current
  `.b .row .card` markup.
