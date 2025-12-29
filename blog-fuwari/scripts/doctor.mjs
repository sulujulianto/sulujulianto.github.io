import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(process.cwd(), "..");
const outDir = path.join(rootDir, "blog");
const configPath = path.join(process.cwd(), "astro.config.mjs");
const pkgPath = path.join(process.cwd(), "package.json");

const checks = [];

const addCheck = (label, ok, detail) => {
  checks.push({ label, ok, detail });
};

const configText = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
addCheck(
  "astro.config: site URL",
  configText.includes('site: "https://sulujulianto.github.io/"'),
  "site should be https://sulujulianto.github.io/"
);
addCheck(
  "astro.config: base path",
  configText.includes('base: "/blog/"'),
  "base should be /blog/"
);
addCheck(
  "astro.config: outDir",
  configText.includes('outDir: "../blog"'),
  "outDir should be ../blog"
);

const pkgJson = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, "utf-8")) : {};
const buildScript = pkgJson.scripts?.build || "";
addCheck(
  "package.json: build script",
  buildScript.includes("pagefind --site ../blog") && buildScript.includes("_pagefind"),
  "build should run pagefind to ../blog/_pagefind"
);

const bannerPath = path.join(process.cwd(), "public", "assets", "images", "banner.webp");
addCheck("banner file", fs.existsSync(bannerPath), "public/assets/images/banner.webp missing");

const faviconPath = path.join(process.cwd(), "public", "favicon", "icon.png");
addCheck("favicon file", fs.existsSync(faviconPath), "public/favicon/icon.png missing");

const rootNoJekyll = path.join(rootDir, ".nojekyll");
addCheck("root .nojekyll", fs.existsSync(rootNoJekyll), ".nojekyll missing at repo root");

const outNoJekyll = path.join(outDir, ".nojekyll");
addCheck(
  "output .nojekyll",
  fs.existsSync(outNoJekyll),
  "run pnpm build to create /blog/.nojekyll"
);

let failed = 0;
for (const c of checks) {
  const status = c.ok ? "PASS" : "FAIL";
  console.log(`${status} - ${c.label}${c.ok ? "" : ` (${c.detail})`}`);
  if (!c.ok) failed++;
}

if (failed > 0) {
  process.exit(1);
}
