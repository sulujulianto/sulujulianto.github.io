import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "..", "blog");

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, ".nojekyll"), "");
