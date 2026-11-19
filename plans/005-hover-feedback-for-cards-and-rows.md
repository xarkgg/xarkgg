# 005 — Add desktop hover feedback to project cards and contact rows

- **Status**: TODO
- **Commit**: d748cfb
- **Severity**: LOW (additive — missed opportunity)
- **Category**: Missed opportunity (feedback)
- **Estimated scope**: 1 file, 1 new media block in `index.html`

## Problem

Every pressable surface on this site answers a press (`:active`), but almost
nothing answers a mouse. `index.html` contains exactly one `:hover` rule in the
whole file (`index.html:513`, a brightness filter on the hire buttons), so on
desktop the two most-clickable surfaces — the eight project cards and the
contact rows — give no affordance until you have already committed to a click.

`index.html:117-119` — current card rules:

```css
.card{position:relative;flex:0 0 auto;width:260px;min-width:0;scroll-snap-align:start;display:flex;flex-direction:column;background:var(--s1);border:1px solid var(--sep);border-radius:18px;overflow:hidden;transition:transform .3s var(--spring)}
.card:active{transform:scale(.97)}
```

The card already has a `transform` transition, so a hover lift needs no new
timing declaration.

`index.html:178-179` — current row rules, with no transition at all:

```css
.group a,.li{display:flex;align-items:center;gap:12px;padding:10px 14px 10px 16px;min-height:52px;min-width:0}
.group a:active,.group summary:active{background:rgba(255,255,255,.05)}
```

## Target

One hover block, gated to real pointers so a tap on a phone does not leave a
stuck hover state, plus a 120ms colour transition on the rows.

```css
/* target — insert immediately after .row.tug (index.html:116),
   BEFORE .card, so the later :active rules still win on press */

.group a,.group summary{transition:background-color .12s ease}

@media (hover:hover) and (pointer:fine){
  .card:hover{transform:translateY(-2px)}
  .group a:hover,.group summary:hover{background:rgba(255,255,255,.05)}
}

[data-theme="light"] .group a:hover,[data-theme="light"] .group summary:hover{background:rgba(0,0,0,.06)}
```

Placement matters twice over:

1. The block must sit **before** `.card:active` (`index.html:119`) and
   `.group a:active` (`index.html:179`). Both equal specificity, so source
   order decides — press must stay the stronger signal.
2. The light-theme override must come **after** the media block so it is not
   overridden by the dark hover tint on the light theme, matching how the
   existing `:active` light override works at `index.html:329`.

## Repo conventions to follow

- Hover tint colour is the one the repo already uses for press on these rows
  (`rgba(255,255,255,.05)` dark, `rgba(0,0,0,.06)` light) — reuse it, do not
  invent a new tint.
- Hover/colour changes take `ease` per the project's curve rules; `120ms` sits
  at the short end because this fires on every pointer pass.
- Card lift reuses the existing `transition:transform .3s var(--spring)` at
  `index.html:117` — no new property list.

## Steps

1. Insert the `.group a,.group summary{transition:…}` rule after `index.html:116`.
2. Insert the gated `@media (hover:hover) and (pointer:fine){…}` block directly
   after it.
3. Insert the light-theme hover overrides directly after the media block, and
   leave the existing light `:active` rules at `index.html:329` untouched.
4. Do not add a hover state to `.chips button`, `.circ`, `.send`, or any nav
   control — those are handled by press feedback and a hover there would be
   noise.

## Boundaries

- Do NOT add hover motion to anything inside the chat thread (bubbles, the
  typing indicator, the delivered label) — that content is read, not aimed at.
- Do NOT use `translateY` values larger than 2px; this is a 260px card in a
  horizontal strip and a larger lift reads as a jump.
- Do NOT remove or weaken any `:active` rule.
- Do NOT add `will-change`.
- If the quoted rules have drifted, STOP and report.

## Verification

- **Mechanical**: no build step. Load the page at 1280×900, console clean.
- **Feel check**:
  - Hover a project card: it lifts 2px smoothly and settles; moving off returns
    it. Press it while hovering: it shrinks (press wins over hover).
  - Hover a contact row in the profile or the contact sheet: the tint fades in
    over ~120ms, and it is the same tint you get when pressing it.
  - Switch to the light theme (toggle in the header) and repeat: the hover tint
    is now the dark-on-light variant, not a white wash.
  - In DevTools device emulation with touch enabled, tap a card: no hover lift
    remains stuck afterwards.
  - Toggle `prefers-reduced-motion`: the tint still appears (colour is not
    motion); the 2px lift is dropped along with all other transitions.
- **Done when**: on desktop both surfaces acknowledge the pointer before the
  click, and nothing on a touch device sticks in the hovered state.
