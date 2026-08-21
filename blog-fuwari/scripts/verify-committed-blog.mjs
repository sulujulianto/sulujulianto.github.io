import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = path.resolve(projectRoot, "..");
const outputRoot = path.join(repoRoot, "blog");

const volatilePagefindPatterns = [
	/^blog\/_pagefind\/fragment\//,
	/^blog\/_pagefind\/index\//,
	/^blog\/_pagefind\/pagefind-entry\.json$/,
	/^blog\/_pagefind\/pagefind\.[^.]+\.pf_meta$/,
];

export function isVolatilePagefindPath(relativePath) {
	return volatilePagefindPatterns.some((pattern) => pattern.test(relativePath));
}

export function normalizeGeneratedHtml(html) {
	return html.replace(
		/(<astro-island\b[^>]*\buid=")[^"]+("[^>]*>)/g,
		"$1<generated>$2",
	);
}

function listCurrentFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return listCurrentFiles(fullPath);
		if (!entry.isFile()) return [];
		return [path.relative(repoRoot, fullPath).replace(/\\/g, "/")];
	});
}

function listCommittedFiles() {
	const output = execFileSync(
		"git",
		["ls-tree", "-r", "--name-only", "HEAD", "--", "blog"],
		{
			cwd: repoRoot,
			encoding: "utf8",
		},
	).trim();

	return output ? output.split("\n") : [];
}

function readCommittedFile(relativePath) {
	return execFileSync("git", ["show", `HEAD:${relativePath}`], {
		cwd: repoRoot,
		maxBuffer: 32 * 1024 * 1024,
	});
}

function comparableFiles(files) {
	return files.filter((file) => !isVolatilePagefindPath(file)).sort();
}

function compareFileLists(committedFiles, currentFiles) {
	const committed = new Set(committedFiles);
	const current = new Set(currentFiles);
	const missing = committedFiles.filter((file) => !current.has(file));
	const unexpected = currentFiles.filter((file) => !committed.has(file));

	return { missing, unexpected };
}

function filesMatch(relativePath) {
	const committed = readCommittedFile(relativePath);
	const current = fs.readFileSync(path.join(repoRoot, relativePath));

	if (!relativePath.endsWith(".html")) return committed.equals(current);

	return (
		normalizeGeneratedHtml(committed.toString("utf8")) ===
		normalizeGeneratedHtml(current.toString("utf8"))
	);
}

function validateGeneratedPagefind() {
	const pagefindRoot = path.join(outputRoot, "_pagefind");
	const entryPath = path.join(pagefindRoot, "pagefind-entry.json");

	if (!fs.existsSync(entryPath)) {
		throw new Error("Pagefind entry tidak ditemukan dalam hasil build");
	}

	const entry = JSON.parse(fs.readFileSync(entryPath, "utf8"));
	const languages = Object.entries(entry.languages ?? {});

	if (!/^\d+\.\d+\.\d+/.test(entry.version ?? "")) {
		throw new Error("Versi Pagefind dalam pagefind-entry.json tidak valid");
	}

	if (languages.length === 0) {
		throw new Error("Pagefind tidak menghasilkan indeks bahasa");
	}

	let expectedPages = 0;
	for (const [language, metadata] of languages) {
		if (
			typeof metadata.hash !== "string" ||
			!Number.isInteger(metadata.page_count) ||
			metadata.page_count < 1
		) {
			throw new Error(`Metadata Pagefind bahasa ${language} tidak valid`);
		}

		expectedPages += metadata.page_count;
		const metaPath = path.join(
			pagefindRoot,
			`pagefind.${metadata.hash}.pf_meta`,
		);
		const wasmPath = path.join(pagefindRoot, `wasm.${metadata.wasm}.pagefind`);

		if (!fs.existsSync(metaPath) || !fs.existsSync(wasmPath)) {
			throw new Error(`Artefak Pagefind bahasa ${language} tidak lengkap`);
		}
	}

	const fragments = fs
		.readdirSync(path.join(pagefindRoot, "fragment"))
		.filter((file) => file.endsWith(".pf_fragment"));
	const indexes = fs
		.readdirSync(path.join(pagefindRoot, "index"))
		.filter((file) => file.endsWith(".pf_index"));

	if (fragments.length < expectedPages || indexes.length === 0) {
		throw new Error("Indeks atau fragment Pagefind tidak lengkap");
	}
}

export function verifyCommittedBlog() {
	if (!fs.existsSync(outputRoot)) {
		throw new Error("Direktori hasil build ../blog tidak ditemukan");
	}

	const committedFiles = comparableFiles(listCommittedFiles());
	const currentFiles = comparableFiles(listCurrentFiles(outputRoot));
	const { missing, unexpected } = compareFileLists(
		committedFiles,
		currentFiles,
	);
	const changed = committedFiles.filter(
		(file) => currentFiles.includes(file) && !filesMatch(file),
	);

	if (missing.length || unexpected.length || changed.length) {
		const sections = [
			missing.length ? `Hilang:\n${missing.join("\n")}` : "",
			unexpected.length ? `Tidak dikomit:\n${unexpected.join("\n")}` : "",
			changed.length ? `Berubah:\n${changed.join("\n")}` : "",
		].filter(Boolean);

		throw new Error(
			`Hasil build blog tidak sesuai commit:\n\n${sections.join("\n\n")}`,
		);
	}

	validateGeneratedPagefind();
	console.log(
		`PASS: ${currentFiles.length} artefak stabil sesuai commit; UID Astro dinormalisasi dan Pagefind valid`,
	);
}

const isMainModule =
	process.argv[1] &&
	path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
	try {
		verifyCommittedBlog();
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	}
}
