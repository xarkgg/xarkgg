# 001 — add-active-feedback-on-text-input

- **Status**: TODO
- **Commit**: bda080a
- **Severity**: LOW
- **Category**: missed-opportunity (Physicality & origin; Accessibility)

## Problem

The text `input.field` (line 197 in `index.html`) has no `:active` press feedback, while all other pressable elements (avatar, icons, send button, chips, pills, tags) receive `:active { transform: scale(0.97) }` with `transition: transform 100ms ease-out`. This is inconsistent — users pressing in the text field get no tactile confirmation the interface heard the press. The text field is a frequently used element (message composition), and consistent press feedback across all input types improves the response principle.

**Current code** (`index.html:197`):

```css
.field{flex:1 1 auto;display:flex;background:#fff;border-radius:999px;box-shadow:var(--shadow)}
```

**Current `:active` patterns** (throughout the file):

```css
/* Send btn */
.send-btn:active{transform:scale(.94);background:var(--blue-alt)}

/* Avatar/icon in chat header */
.chat-header .avatar-btn:active,
.chat-header .icon-btn:active{transform:scale(0.96)}

//* General :active pattern added in Apple Design refurb */
.button:active {transform: scale(0.97); transition: transform 100ms ease-out}
```

## Target

Add `:active { transform: scale(0.98); transition: transform 100ms ease-out }` on `.field` with a `prefers-reduced-motion` guard that drops the transform and keeps only the background change (no transform needed for reduced-motion users). The target excerpt:

```css
.field{flex:1 1 auto;display:flex;background:#fff;border-radius:999px;box-shadow:var(--shadow)}
.field:active{transform:scale(0.98);transition:transform 100ms ease-out}

/* Reduced motion — drop the transform, keep background feedback */
@media (prefers-reduced-motion: reduce) {
  .field:active{transform:none;transition:none}
}
```

## Repo conventions to follow

- Easing token: `--ease:cubic-bezier(.32,.72,0,1)` (already defined in `:root`); use `100ms` to match button press budget
- Spring constants: `--spring-damping:1.0` / `--spring-response:0.3` (already defined); this uses CSS transition, not spring, so the vars are informational
- Existing exemplar: `.button:active {transform: scale(0.97); transition: transform 100ms ease-out}` at the top of the file (Apple Design refurb); the `.field` target mirrors this exact pattern
- The `prefers-reduced-motion` gate follows the existing pattern at lines 62, 380, 601, 622, 732, 808 of `index.html`

## Steps

1. In `index.html`, locate `.field{...}` (line 197) and add the `:active` rule and the reduced-motion media query:
   - Add `field:active {transform: scale(0.98); transition: transform 100ms ease-out;}` inside the `.field { ... }` block
   - Add `@media (prefers-reduced-motion: reduce) { .field:active {transform: none; transition: none; } }` immediately after the `.field` block
2. Verify: open the page, focus the message input, press and hold — the input should scale down 2% instantly and snap back on release. Toggle `prefers-reduced-motion` on (OS level or DevTools Rendering panel) — the input should NOT scale; only the background color change (if any) should remain.
3. Commit the change locally; no build or formatter runs required.

## Boundaries

- Do NOT touch the `.field input` styles (the inner input element); only modify `.field` the wrapper
- Do NOT change the form submission flow or the `/api/message` endpoint
- Do NOT add any new CSS files or import statements — all changes stay inline in `index.html`
- Do NOT remove any existing `:active` patterns on other elements; add only to `.field`

## Verification

- **Mechanical**: No errors when opening `index.html` in a browser; CSS validates via the browser's dev tools
- **Feel check**:
  - Press-and-hold on the message input field: element scales to 98% of original size, animates with 100ms ease-out
  - Release: element returns to 100% immediately
  - Toggle `prefers-reduced-motion` (DevTools → Rendering panel): element does NOT scale; the `:active` transform is suppressed
- **Done when**: The `:active` scaling on `.field` is present in the CSS, gated by `prefers-reduced-motion`, and verified by the feel-check steps above.