# 001 — Restore the chip press feedback and shorten the chip entrance

- **Status**: TODO
- **Commit**: d748cfb
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Easing & duration
- **Estimated scope**: 1 file, 6 lines of CSS in `index.html`

## Problem

The five topic chips (Projects / Stack / Education / Certs / Contact) have a
press state that **never renders**. The entrance animation is declared with
`animation-fill-mode: both`, so once `pop` finishes its final keyframe
`transform: none` is applied at the animation origin — and animations beat
normal declarations. That permanently overrides the `:active` scale, so the
ring colours on press but the shrink never happens.

`index.html:157` — current:

```css
.chips button{flex:none;max-width:220px;overflow:hidden;text-overflow:ellipsis;border-radius:999px;padding:0 16px;height:44px;font-size:15px;white-space:nowrap;color:var(--ink);font-weight:500;animation:pop .45s var(--spring) both;transition:transform .25s var(--spring),box-shadow .25s}
```

`index.html:158` — the press rule it is silently killing:

```css
.chips button:active,.chips button:focus-visible{transform:scale(.94);outline:0;box-shadow:inset 0 0 0 1px var(--ring),0 0 0 1px rgba(255,255,255,.15)}
```

Keyframe (`index.html:97`):

```css
@keyframes pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
```

Second problem, same element: `450ms` is outside the UI budget (animations
stay under 300ms), and all five chips pop simultaneously with no stagger, so
the row lands as one block on the one occasion a visitor sees it.

## Target

`fill-mode: backwards` instead of `both` — the entrance releases `transform`
when it ends, so `:active` works again — a 300ms duration, and a 40ms stagger.

```css
/* target — replace the animation declaration on .chips button */
.chips button{flex:none;max-width:220px;overflow:hidden;text-overflow:ellipsis;border-radius:999px;padding:0 16px;height:44px;font-size:15px;white-space:nowrap;color:var(--ink);font-weight:500;animation:pop .3s var(--spring) backwards;transition:transform .25s var(--spring),box-shadow .25s}

/* target — new rules, immediately after the existing :active rule */
.chips button:nth-child(2){animation-delay:40ms}
.chips button:nth-child(3){animation-delay:80ms}
.chips button:nth-child(4){animation-delay:120ms}
.chips button:nth-child(5){animation-delay:160ms}
```

`backwards` (not `forwards`/`both`) is load-bearing: it applies the `from`
keyframe during the stagger delay so a chip is invisible until its turn, then
stops participating in the cascade once the animation ends.

## Repo conventions to follow

- Easing tokens live on `:root{…}` at `index.html:43`:
  `--spring:cubic-bezier(.34,1.56,.64,1)` — already used by this entrance; keep it.
- The correct existing exemplar is the project card entrance at
  `index.html:101`: `animation:x-card .3s var(--ease-out) backwards` — 300ms,
  `backwards`. Copy that shape.
- `index.html:116` `.row.tug{animation:x-tug 1.1s var(--ease-out) both}` is
  safe to leave: the row has no other transform, and the class is removed on
  `animationend`.

## Steps

1. In `index.html`, on line 157, change `animation:pop .45s var(--spring) both`
   to `animation:pop .3s var(--spring) backwards`. Change nothing else in that
   declaration.
2. Immediately after line 158 (the `:active`/`:focus-visible` rule), add the
   four `animation-delay` rules exactly as in **Target**.
3. Confirm there are exactly five chip buttons so the delays map 1:1
   (`index.html:549-553`). If the count differs, STOP and report.

## Boundaries

- Do NOT touch `@keyframes pop`, `.chipw`, `.chips` (the scroll container), or
  the chip markup.
- Do NOT change the `:active` / `:focus-visible` rule itself — it is correct.
- Do NOT add a reduced-motion rule; the global block at `index.html:417`
  already sets `animation:none!important`.
- Never introduce `transform: scale(0)`.
- If line 157 no longer reads as quoted above, STOP and report drift.

## Verification

- **Mechanical**: no build step. Open the page, check the console is clean.
- **Feel check**: wait for the two intro messages until the chip row is
  revealed (`#chipw` loses `hidden`), then:
  - The five chips appear one after another, roughly 40ms apart, not as a block.
  - In DevTools, set the Animations panel to 10% playback and confirm the
    stagger is visible and the last chip finishes in ~400ms.
  - Press and hold any chip: it shrinks to 94% **while held** and springs back
    on release. This is the check that proves the fill-mode fix — it must fail
    on the old `both` value and pass after the change.
  - Tab to a chip with the keyboard: the ring appears and the same 94% shrink
    applies.
  - Toggle `prefers-reduced-motion` (Rendering panel): chips appear instantly,
    and press still gives the box-shadow ring (movement removed, feedback kept).
- **Done when**: holding a chip visibly scales it, and the row enters with a
  perceived stagger rather than all at once.
