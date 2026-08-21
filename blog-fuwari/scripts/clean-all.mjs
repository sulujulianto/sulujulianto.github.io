import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";

const projectRoot = process.cwd();
const astroDir = path.join(projectRoot, ".astro");
const viteCacheDir = path.join(projectRoot, "node_modules", ".vite");
const outDir = path.resolve(projectRoot, "..", "blog");

if (fs.existsSync(astroDir)) {
  await rm(astroDir, { recursive: true, force: true });
}

if (fs.existsSync(viteCacheDir)) {
  await rm(viteCacheDir, { recursive: true, force: true });
}

if (fs.existsSync(outDir)) {
  const entries = await readdir(outDir);
  for (const entry of entries) {
    if (entry === ".gitkeep") continue;
    await rm(path.join(outDir, entry), { recursive: true, force: true });
  }
}
