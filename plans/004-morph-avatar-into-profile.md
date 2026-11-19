# 004 — Morph the avatar into the profile photo when the profile opens

- **Status**: TODO
- **Commit**: d748cfb
- **Severity**: LOW (additive — missed opportunity)
- **Category**: Missed opportunity (spatial consistency)
- **Estimated scope**: 1 file, 1 function in `index.html`

## Problem

The site already has a View Transition wired for the profile photo: the small
avatar in the chat header is named `pfp`, and the large photo in the profile is
named `pfp` only while the profile is open. Closing the profile therefore
animates the big photo back down into the header avatar — a clean spatial
story. Opening it does not: `openProfile()` toggles the class directly, so the
panel slides in while the photo has no continuity at all.

`index.html:797` — current:

```js
function openProfile(){if(desk.matches){dev.classList.add("pexp");$("profile").classList.add("x-exp");$("profile").scrollTop=0;setTimeout(function(){$("back").focus()},80);return}dev.classList.add("prof");$("profile").setAttribute("aria-hidden","false");$("profile").scrollTop=0;ghEnd();setTimeout(function(){$("back").focus()},80)}
```

`index.html:798` — the close path that already does it right:

```js
function closeProfile(){if(desk.matches){dev.classList.remove("pexp","cexp");$("profile").classList.remove("x-exp");$("profile").scrollTop=0;return}morph(function(){dev.classList.remove("prof");$("profile").setAttribute("aria-hidden","true")});$("toProfile").focus()}
```

Supporting pieces that already exist and must not be touched:
`morph()` at `index.html:783`, the name assignment at `index.html:250-253`,
and the 400ms `::view-transition-group(pfp)` timing at `index.html:253`.

## Target

Wrap the mobile branch's DOM change in `morph()`, and move the scroll reset
and GitHub-graph scroll-end **inside** the callback so they measure the profile
in its open state rather than depending on when the update callback runs.

```js
/* target — index.html:797 */
function openProfile(){if(desk.matches){dev.classList.add("pexp");$("profile").classList.add("x-exp");$("profile").scrollTop=0;setTimeout(function(){$("back").focus()},80);return}morph(function(){dev.classList.add("prof");$("profile").setAttribute("aria-hidden","false");$("profile").scrollTop=0;ghEnd()});setTimeout(function(){$("back").focus()},80)}
```

Everything else in the line stays identical — the desktop branch, the focus
timeout, `ghEnd()`'s own `requestAnimationFrame`.

## Repo conventions to follow

- `morph(fn)` is the repo's one wrapper for view transitions: it calls
  `document.startViewTransition(fn)` when available and falls back to `fn()`
  synchronously, so behaviour without VT support is unchanged.
- The repo already gates the 400ms pfp morph to `150ms` and drops it entirely
  under reduced motion (`index.html:420-421`), so no new motion-safety work is
  needed.
- Keep the existing one-line function style; this file is hand-minified on
  purpose.

## Steps

1. Replace the mobile branch of `openProfile()` with the target line above.
2. Do not touch `closeProfile()`, `morph()`, or any CSS.
3. Confirm `#toProfile img` and `.big` still point at the same image
   (`index.html:537` and `index.html:565`, both `assets/avatar-profile.jpg`).
   If they differ, STOP — the morph would cut between two photos.

## Boundaries

- Do NOT change the desktop (`desk.matches`) branch — the pane expand is
  motion plan 003, not this.
- Do NOT add a transition to `#profile`; the slide is replaced by the morph on
  open, and on close by the existing morph. Do not "fix" that asymmetry by
  removing the close morph.
- Do NOT set `view-transition-name` anywhere new — the pair already exists.
- Do NOT touch `aria-hidden` ordering beyond the callback; it must happen
  inside it so the two snapshots differ.

## Verification

- **Mechanical**: no build step. Load the page at phone width (≤768px) and
  check the console for `startViewTransition` errors.
- **Feel check** (phone width in DevTools, throttled motion so you can see it):
  - Tap the avatar in the chat header: the small photo grows into the large
    profile photo over ~400ms while the rest of the panel appears around it.
  - Tap back: the large photo shrinks back into the header avatar — the same
    gesture in reverse, same duration, same path.
  - Set the Animations panel to 10% playback and confirm both directions
    interpolate position and size, with no cross-fade of the two photos.
  - Scroll the profile down, close, reopen: the profile still opens scrolled to
    the top, and the contribution graph is still scrolled to its right edge.
  - Toggle `prefers-reduced-motion`: both directions become instant, with no
    error and no stuck state.
  - **Judgement call to record**: if the open now reads as *abrupt* — the panel
    materialising with no slide while only the photo flies — do NOT invent a
    third behaviour. Instead remove `morph()` from `closeProfile()` so both
    directions use the CSS slide, and report that the morph was dropped for
    symmetry. Symmetry is the goal; the morph is the preferred means.
- **Done when**: opening and closing the profile are the same gesture in
  reverse, and the profile still opens scrolled to the top with the graph at
  its end.
