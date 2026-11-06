/**
 * Builds the static-site flavour of the nano preloader:
 *
 *   vendor/nano-preloader/nano-preloader.js   React + tsparticles, IIFE
 *   vendor/nano-preloader/nano-preloader.css  scoped Tailwind utilities
 *
 * Run with: npm run build:preloader
 *
 * The generated files are committed, so the site itself stays static (no build
 * step on Vercel/Netlify). Re-run this after editing NanoPreloader.tsx.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, transform } from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "vendor", "nano-preloader");
const scope = "#nano-preloader-root";
const cssEntry = path.join(root, "scripts", "nano-preloader.css");

/** Prefixes every generated selector so utilities cannot leak into the site. */
const scopePlugin = {
  postcssPlugin: "scope-nano-preloader",
  Once(css) {
    css.walkRules((rule) => {
      const parent = rule.parent;

      if (parent?.type === "atrule" && /keyframes$/i.test(parent.name)) {
        return;
      }

      rule.selectors = rule.selectors.map((selector) => {
        const value = selector.trim();

        if (value.startsWith(scope)) return value;
        if (value === ":root" || value === ":host") return scope;
        if (value.startsWith(":root") || value.startsWith(":host")) {
          return value.replace(/^(:root|:host)/, scope);
        }

        return `${scope} ${value}`;
      });
    });
  },
};

/** Fails the build if any generated rule escapes the preloader subtree. */
function assertScoped(css) {
  const failures = [];

  css.walkRules((rule) => {
    const parent = rule.parent;
    if (parent?.type === "atrule" && /keyframes$/i.test(parent.name)) return;

    for (const selector of rule.selectors) {
      if (!selector.trim().startsWith(scope)) {
        failures.push(selector);
      }
    }
  });

  if (failures.length) {
    throw new Error(
      `Preloader CSS leaked outside ${scope}:\n  ${failures.slice(0, 10).join("\n  ")}`,
    );
  }
}

const source = await readFile(cssEntry, "utf8");
const compiled = await postcss([tailwindcss()]).process(source, { from: cssEntry });
const scoped = await postcss([scopePlugin]).process(compiled.css, { from: undefined });

assertScoped(postcss.parse(scoped.css));

const minifiedCss = await transform(scoped.css, {
  loader: "css",
  minify: true,
  target: ["chrome110", "safari15"],
});

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "nano-preloader.css"), minifiedCss.code);

await build({
  entryPoints: [path.join(root, "scripts", "nano-preloader-host.tsx")],
  outfile: path.join(outDir, "nano-preloader.js"),
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["chrome110", "safari15"],
  jsx: "automatic",
  legalComments: "eof",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});

console.log(`\nPreloader built into ${path.relative(root, outDir)}/`);
