# 003 — Tighten the desktop profile expand

- **Status**: TODO
- **Commit**: d748cfb
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file, 2 rules in `index.html`

## Problem

On desktop the profile sits left and the chat right. Clicking either pane
toggles `pexp` / `cexp`, which changes the profile column width and slides the
chat over. That transition runs at **800ms**, roughly double the top of the
modal/drawer budget (200–500ms), and it is a toggle people press repeatedly
while reading — it reads as sluggish, not premium.

`index.html:447-448` — current:

```css
#profile,.prof #profile{border-right:0;transition:width .8s var(--slide),transform .8s var(--slide),opacity .8s var(--slide)}
#chat,.prof #chat{border-radius:28px 0 0 28px;overflow:hidden;z-index:7;box-shadow:-1px 0 0 rgba(255,255,255,.07),-18px 0 50px rgba(0,0,0,.55);transition:transform .8s var(--slide),left .8s var(--slide),border-radius .8s var(--slide)}
```

Second, the profile's eight sections fade up at **600ms** every time the pane
expands — all of them at once, `both` fill. This animation exists to mask a
grid re-layout (`grid-template-areas` changes instantly and cannot be
transitioned); it is doing a real job, just too slowly.

`index.html:470` — current:

```css
.pexp #profile>.sec,.pexp #profile>.phero{animation:x-fadein .6s var(--ease) both}
```

Keyframe (`index.html:471`):

```css
@keyframes x-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
```

## Target

Keep both curves — only the durations change. `.5s` is the top of the drawer
budget and still carries a 380px-wide pane. `280ms` keeps the settle that
masks the grid jump while landing inside the 300ms UI budget. `both` becomes
`backwards` so the fade cannot pin `transform` on the sections.

```css
/* target — index.html:447 */
#profile,.prof #profile{border-right:0;transition:width .5s var(--slide),transform .5s var(--slide),opacity .5s var(--slide)}

/* target — index.html:448 (keep the box-shadow exactly as it is) */
#chat,.prof #chat{border-radius:28px 0 0 28px;overflow:hidden;z-index:7;box-shadow:-1px 0 0 rgba(255,255,255,.07),-18px 0 50px rgba(0,0,0,.55);transition:transform .5s var(--slide),left .5s var(--slide),border-radius .5s var(--slide)}

/* target — index.html:470 */
.pexp #profile>.sec,.pexp #profile>.phero{animation:x-fadein .28s var(--ease) backwards}
```

## Repo conventions to follow

- `--slide:cubic-bezier(.45,0,.2,1)` is the repo's curve for large on-screen
  movement (`index.html:483`) — it is correct for this, do not swap it for
  `--ease` or `--spring`.
- `--ease:cubic-bezier(.22,1,.36,1)` (`index.html:43`) is the repo's entrance
  curve and is already used by `x-fadein`.
- `backwards` is the repo's settled convention on any element that also has a
  `:hover`/`:active` transform; `.sec` and `.phero` have none, but use it
  anyway so the pattern matches `index.html:101` and `index.html:119`.

## Steps

1. On line 447, replace each `.8s` with `.5s` (three occurrences). Change
   nothing else.
2. On line 448, replace each `.8s` with `.5s` (three occurrences). Leave the
   `box-shadow` value byte-identical.
3. On line 470, replace `.6s` with `.28s` and `both` with `backwards`.
4. Do NOT add a stagger to the sections. `#profile` is a CSS grid whose areas
   are re-assigned per breakpoint, so `nth-child` no longer maps to visual
   order — a stagger here would fire in an order the user does not see. This is
   a deliberate omission, not an oversight.

## Boundaries

- Do NOT touch the mobile rules (`.prof #profile`, `.prof #chat` at
  `index.html:242-244`) — those ride the `.view` transition at
  `index.html:73` and are already correct.
- Do NOT change `--slide`, `--ease`, `@keyframes x-fadein`, or the grid
  definitions.
- Do NOT convert the pane change to `transform` only; the pane genuinely
  changes layout width and that is out of scope here.
- If the quoted rules have drifted, STOP and report.

## Verification

- **Mechanical**: no build step. Open the page at ≥960px wide, console clean.
- **Feel check** (desktop width, e.g. 1280×900):
  - Click the profile pane to expand: the chat slides away in about half a
    second, and the profile content settles without a visible snap while the
    grid re-lays out.
  - Click the chat pane to collapse back: the return trip is the same speed —
    no asymmetry.
  - Toggle the two panes five times quickly: the transition retargets from
    mid-flight each time and never restarts from zero (class-toggle
    transitions, not keyframes).
  - Set the Animations panel to 10%: the sections rise ~8px into place and are
    fully settled well before the pane finishes moving.
  - Toggle `prefers-reduced-motion`: the pane jumps, and the sections are
    visible immediately (global block at `index.html:417` plus the fade
    override at `index.html:418`).
- **Done when**: an expand/collapse round trip feels like one quick move rather
  than a slow one, and no section ever appears mid-flight.
