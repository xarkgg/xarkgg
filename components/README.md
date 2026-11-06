# NanoPreloader

Full-screen "nano pieces" loading overlay: a black field of tiny coloured
circles, triangles and line segments orbiting a centred avatar, with faint link
lines between particles and a quiet `Standing by…` label. Built with React 19,
[tsparticles](https://tsparticles.github.io/) v3 and Tailwind utilities.

## Using it in a React app

The host project must have Tailwind CSS enabled (the component styles itself
with utility classes and ships its own keyframes).

```tsx
import NanoPreloader from "./components/NanoPreloader";

<NanoPreloader
  avatarSrc="/assets/avatar-profile.jpg"
  ready={appReady}                 // optional
  minDuration={2200}               // ms, default 2200
  fadeDuration={750}               // ms, default 750
  onFinish={() => setShow(false)}  // called once, after the fade
/>
```

- Leave `ready` undefined and the overlay exits by itself after
  `minDuration`; pass `ready={false}` while booting and flip it to `true` when
  the app is usable.
- If `avatarSrc` is missing or fails to load, the `monogram` (default `X`) is
  shown instead.
- `prefers-reduced-motion: reduce` disables the orbit/rise animations and slows
  the particles down.

## Static build in this repo

The portfolio is plain HTML with no runtime build step. `scripts/build-preloader.mjs`
bundles the component into committed artifacts:

- `vendor/nano-preloader/nano-preloader.js` — React + tsparticles, IIFE
- `vendor/nano-preloader/nano-preloader.css` — component-only Tailwind CSS,
  every selector scoped under `#nano-preloader-root`

Rebuild after editing the component:

```sh
npm run build:preloader
```

`index.html` loads the CSS in `<head>`, opens with a black boot layer that shows
the monogram until React mounts, and loads the deferred bundle at the end of
`<body>`. A `<noscript>` rule plus a 12-second guard remove the boot layer if
JavaScript is unavailable, so the page can never stay black.

## Why tsparticles v3

The component is pinned to `@tsparticles/react@3.0.0` / `@tsparticles/*@3.9.1`.
The v4 packages publish a `types` path that does not exist
(`./lib/index.d.ts`), which breaks TypeScript consumers.
