// Render a 1200x630 social card: a real screenshot of the site wrapped in a
// fake browser window. One browser pass, no image editing, no @vercel/og.
//
//   node scripts/og-card.mjs                 -> assets/og/home.png
//   node scripts/og-card.mjs --width 1200 --height 630 --out assets/og/home.png
//
// The site is served from a throwaway local server so the frame renders the
// real page (real fonts, real layout) instead of a stitched image.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUPPETEER =
  '/data/data/com.termux/files/usr/lib/node_modules/puppeteer/lib/puppeteer/puppeteer.js';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const W = Number(arg('width', 1200));
const H = Number(arg('height', 630));
const OUT = resolve(ROOT, arg('out', 'assets/og/home.png'));
const URL_LABEL = arg('url', 'xarkgg.vercel.app');
const DELAY = Number(arg('delay', 1400));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

function serve() {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = join(ROOT, path === '/' ? 'index.html' : path);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((done) => {
    server.listen(0, '127.0.0.1', () => done({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

// Card geometry, derived from the requested size so other sizes still work.
const pad = Math.round(H * 0.095);          // outer breathing room
const frameW = W - pad * 2;
const chromeH = Math.round(H * 0.064);      // title bar height
const radius = Math.round(H * 0.024);

function cardHtml(origin) {
  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    background: #0B0B0F;
    background-image:
      radial-gradient(120% 70% at 12% 0%, rgba(255,255,255,.055), transparent 62%),
      radial-gradient(90% 60% at 100% 100%, rgba(77,123,234,.10), transparent 60%);
    font-family: Inter, system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .window {
    width: ${frameW}px;
    border-radius: ${radius}px;
    overflow: hidden;
    background: #15161B;
    box-shadow:
      0 0 0 1px rgba(255,255,255,.09),
      0 ${Math.round(H * 0.08)}px ${Math.round(H * 0.13)}px -${Math.round(H * 0.04)}px rgba(0,0,0,.85),
      0 0 0 ${Math.round(H * 0.05)}px rgba(255,255,255,.015);
  }
  .chrome {
    height: ${chromeH}px;
    display: flex;
    align-items: center;
    gap: ${Math.round(chromeH * 0.3)}px;
    padding: 0 ${Math.round(chromeH * 0.42)}px;
    background: linear-gradient(180deg, #1B1C22, #15161B);
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .dots { display: flex; gap: ${Math.round(chromeH * 0.2)}px; flex: 0 0 auto; }
  .dots i {
    display: block;
    width: ${Math.round(chromeH * 0.24)}px;
    height: ${Math.round(chromeH * 0.24)}px;
    border-radius: 50%;
    opacity: .9;
  }
  .dot-r { background: #FF5F57; }
  .dot-y { background: #FEBC2E; }
  .dot-g { background: #28C840; }
  .pill {
    flex: 0 1 ${Math.round(frameW * 0.42)}px;
    height: ${Math.round(chromeH * 0.56)}px;
    margin-inline: auto;
    border-radius: ${Math.round(chromeH * 0.16)}px;
    background: rgba(255,255,255,.055);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #8A8F98;
    font-size: ${Math.round(chromeH * 0.27)}px;
    font-weight: 500;
    letter-spacing: .01em;
  }
  .lock { width: .74em; height: .74em; opacity: .75; }
  .viewport {
    position: relative;
    height: ${H - pad * 2 - chromeH}px;
    overflow: hidden;
    background: #0B0B0F;
  }
  .viewport iframe {
    display: block;
    width: ${frameW}px;
    height: ${Math.round(H * 1.25)}px;  /* taller than the crop so it reads as a window */
    border: 0;
    pointer-events: none;
  }
</style></head>
<body>
  <div class="window">
    <div class="chrome">
      <div class="dots"><i class="dot-r"></i><i class="dot-y"></i><i class="dot-g"></i></div>
      <div class="pill">
        <svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
          <rect x="4" y="10.5" width="16" height="10" rx="2.5"/>
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>
        </svg>
        <span>${URL_LABEL}</span>
      </div>
    </div>
    <div class="viewport"><iframe src="${origin}/" title="preview"></iframe></div>
  </div>
</body></html>`;
}

const { server, origin } = await serve();
const puppeteer = (await import(PUPPETEER)).default;

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--font-render-hinting=none'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await page.setContent(cardHtml(origin), { waitUntil: 'networkidle0', timeout: 45000 });

  // Reach into the previewed page: kill its scrollbar, force the dark theme,
  // and wait for its own fonts so the crop isn't an unstyled flash.
  const frame = page.frames().find((f) => f !== page.mainFrame());
  await frame.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const style = document.createElement('style');
    style.textContent = 'html{scrollbar-width:none!important}html::-webkit-scrollbar{display:none!important}';
    document.head.appendChild(style);
  }).catch(() => {});

  await page.evaluate(() => document.fonts.ready).catch(() => {});

  // The page fills its view counter from a network request; without someone
  // waiting on it the card can capture the "—" placeholder instead of a number.
  await frame
    .waitForFunction(
      () => {
        const el = document.getElementById('vc');
        return !el || /\d/.test(el.textContent);
      },
      { timeout: 10000 },
    )
    .catch(() => console.warn('view counter never resolved; card may show "—"'));

  await new Promise((r) => setTimeout(r, DELAY));

  await mkdir(dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT, type: 'png' });
  console.log(`wrote ${OUT}`);
} finally {
  await browser.close();
  server.close();
}
