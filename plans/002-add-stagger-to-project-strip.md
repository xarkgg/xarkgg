# 002 — add-stagger-to-project-strip

- **Status**: TODO
- **Commit**: bda080a
- **Severity**: LOW
- **Category**: missed-opportunity (Cohesion & tokens)

## Problem

The project strip (`.strip` at line 297 in `index.html`) contains 3 polaroid cards (`.polaroid`) rendered via `PROJECTS.forEach()`. On first profile view, GSAP enters each card individually with `gsap.from(card, {y:20, opacity:0, duration:0.5, ease:'power2.out'})` (lines 733-734 in the original code), but they all start from the same state simultaneously — there is no stagger between them. A 15–30ms staggered entrance would make the strip feel more alive and cohesive, signaling to the viewer that each project is a distinct entry rather than all appearing at once. This is a decorative, occasional-frequency enhancement (the profile view is not hit 100+/day), well within the delight budget.

**Current code** (`index.html:733-734`):

```javascript
if (typeof gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.utils.toArray('.polaroid').forEach(function(card){
    gsap.from(card, {y:20, opacity:0, duration:0.5, ease:'power2.out'});
    // ... hover tweens
  });
}
```

No stagger is applied — each card animates from `y:20, opacity:0` independently.

## Target

Add a `stagger: {each: 0.015, from: 'start'}` to the GSAP `from` tween so the 3 project cards enter sequentially with 15ms between each, still using the existing `power2.out` ease and `duration: 0.5`. The target excerpt from the JS block:

```javascript
gsap.from(card, {y:20, opacity:0, duration:0.5, ease:'power2.out', stagger:{each:0.015, from:'start'}});
```

The full guard block stays the same — `prefers-reduced-motion` already gates the entire `if` at line 732.

## Repo conventions to follow

- GSAP easing: `power2.out` (already the convention for polaroid on-mount in this codebase)
- Existing guard: `if (typeof gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)` — keep unchanged; the stagger is additive within the same guard
- Token consistency: no new easing curves or durations introduced; 0.015s = 15ms is within the 30–80ms group-entrance budget from [AUDIT.md]
- The polaroid hover tweens (lines 736-739) are unaffected — only the mount `gsap.from` gets the stagger parameter

## Steps

1. In `index.html`, locate the GSAP `from` tween block (lines 733-734). Edit the `gsap.from(card, {...})` call to add `stagger:{each:0.015, from:'start'}` as a new property:
   - Before: `gsap.from(card, {y:20, opacity:0, duration:0.5, ease:'power2.out'});`
   - After: `gsap.from(card, {y:20, opacity:0, duration:0.5, ease:'power2.out', stagger:{each:0.015, from:'start'}});`
2. Verify: open the profile page, the 3 project polaroids should enter sequentially (first card at t=0, second at t=15ms, third at t=30ms), each fading in and moving up 20px with the `power2.out` curve. The hover tweens remain unchanged. Toggle `prefers-reduced-motion` — the entire GSAP block is gated off, so no stagger appears (correct behavior).
3. Commit the change locally.

## Boundaries

- Do NOT add any new GSAP external dependencies — the `stagger` parameter is built into GSAP 3.12.5 already loaded via CDN
- Do NOT modify the polaroid hover enter/leave tweens (lines 736-739); only the mount `gsap.from` gets the stagger
- Do NOT remove the `prefers-reduced-motion` guard — it must remain to gate all GSAP animation for users who request it
- Do NOT change the `duration` or `ease` — keep `0.5` and `power2.out` exactly as-is

## Verification

- **Mechanical**: No errors when opening `index.html`; GSAP CDN loads correctly; the `stagger` parameter is valid GSAP syntax
- **Feel check**:
  - Profile page load: the 3 project cards enter one after another with ~15ms gaps, fading up from `y:20` with `power2.out` easing
  - Rapid repeated profile opens: stagger retargets from current state each time (GSAP `from` with `stagger` handles this correctly — each replay starts from the current on-screen position)
  - Toggle `prefers-reduced-motion` (DevTools → Rendering panel): the GSAP `from` + stagger is suppressed entirely; cards appear instantly at their final position (no animation), which is the expected reduced-motion behavior
- **Done when**: The `stagger:{each:0.015, from:'start'}` parameter is present in the `gsap.from` call, the feel-check steps pass, and the reduced-motion gate works correctly.

## Status after this plan

If this plan is executed, the project strip will have a subtle 15ms stagger on mount — a LOW-impact decorative polish that improves cohesion without any budget or accessibility concern. This is the second of two missed-opportunity plans; the first (001-add-active-feedback-on-text-input) addresses a more universally felt consistency gap.