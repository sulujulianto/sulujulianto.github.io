import fs from "node:fs";
import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const repoRoot = path.resolve(projectRoot, "..");
const astroDir = path.join(projectRoot, ".astro");
const viteCacheDir = path.join(projectRoot, "node_modules", ".vite");
const outDir = path.join(repoRoot, "blog");

function assertChildPath(parent, target, expectedRelativePath) {
	const relativePath = path.relative(parent, target);
	if (
		relativePath !== expectedRelativePath ||
		relativePath.startsWith("..") ||
		path.isAbsolute(relativePath)
	) {
		throw new Error(`Menolak membersihkan path tidak terduga: ${target}`);
	}
}

assertChildPath(projectRoot, astroDir, ".astro");
assertChildPath(projectRoot, viteCacheDir, path.join("node_modules", ".vite"));
assertChildPath(repoRoot, outDir, "blog");

for (const cacheDir of [astroDir, viteCacheDir]) {
	if (fs.existsSync(cacheDir)) {
		await rm(cacheDir, { recursive: true, force: true });
	}
}

if (fs.existsSync(outDir)) {
	const entries = await readdir(outDir);
	for (const entry of entries) {
		if (entry === ".gitkeep") continue;
		await rm(path.join(outDir, entry), { recursive: true, force: true });
	}
}
