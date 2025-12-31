import { rm, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "..");
const outDir = path.join(repoRoot, "blog");

if (!outDir.endsWith(`${path.sep}blog`)) {
	throw new Error(`Refusing to clean unexpected path: ${outDir}`);
}

if (path.relative(repoRoot, outDir) !== "blog") {
	throw new Error(`Output directory must be ../blog (got: ${outDir})`);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, ".nojekyll"), "");
