# xarkgg

Portfolio site for **Manass Kusko** (Xark) — `@xarkgg`, smart contract dev.

The whole site is a WhatsApp-style chat: the home screen is a conversation, the
avatar opens a profile page, and the message box doubles as the contact form.

## Stack

Plain HTML, CSS and JavaScript in a single `index.html`. No framework, no build
step, no bundler. Mobile-first, light theme in the brand palette
(`#003FC0` / `#023EC0` / `#EEEEEE` / `#EFEFEF`).

## Local preview

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Opening `index.html` directly works too, but serving it over HTTP matches how the
GitHub-contributions and view-counter requests behave in production.

## Structure

```
index.html            the entire site (markup, styles, behaviour)
assets/
  avatar-header.png   header avatar (white fill)
  avatar-profile.jpg  profile avatar (blue fill)
  wallpaper.jpg       chat background
  thumbs/*.jpg        project thumbnails
netlify.toml          publish settings + security headers
```

Photo-edit drafts (`assets/pfp*.png`, `assets/wallpaper.png`) are git-ignored;
only the optimised derivatives are committed.

## Runtime data

Two small public APIs are called from the browser, both CORS-enabled:

- **View counter** — `abacus.jasoncameron.dev/hit/xarkgg/portfolio`. Increments
  once per visit and shows the returned total. Falls back to a placeholder if the
  request fails.
- **GitHub activity** — `github-contributions-api.jogruber.de/v4/xarkgg`. Powers
  the contribution heatmap and its yearly total. A snapshot is embedded in
  `index.html` (`GH_FALLBACK`) so the graph still renders offline.

## Deploying

The repo is static, so any static host works. Netlify config is included:

- **Netlify (drag-and-drop):** open the Netlify dashboard and drop this folder
  onto it. `netlify.toml` supplies the publish directory and headers.
- **Netlify (Git):** connect the repo in **Site settings → Build & deploy → Link
  repository** and authorize GitHub. Netlify's free plan supports private repos,
  so a private `xarkgg` repo deploys fine. Publish directory `.`, no build command.
- **Vercel:** `npx vercel --prod` from this directory, or import the repo. There
  is no build step; Vercel serves the static files directly.
- **GitHub Pages:** needs a public repo on the free plan, so it will not work
  while this repo stays private.

After the first deploy, update the `og:image` / `og:url` tags in `index.html` with
the live URL so link previews resolve absolutely.

## Content notes

Experience entries use real project periods (from each repo's own history);
"My School Guide" and the hackathon line are team/ongoing entries with no fixed
dates. Project links are external (each project's live site, or its GitHub repo).