import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
	isVolatilePagefindPath,
	normalizeGeneratedHtml,
} from "../scripts/verify-committed-blog.mjs";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = path.resolve(projectRoot, "..");

const read = (relativePath) =>
	fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

function listMarkdownFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return listMarkdownFiles(fullPath);
		return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
	});
}

test("konfigurasi produksi mempertahankan base path dan metadata blog", () => {
	const astroConfig = read("astro.config.mjs");
	const siteConfig = read("src/config.ts");
	const layout = read("src/layouts/Layout.astro");
	const robots = read("src/pages/robots.txt.ts");

	assert.match(astroConfig, /site:\s*"https:\/\/sulujulianto\.github\.io\/"/);
	assert.match(astroConfig, /base:\s*"\/blog\/"/);
	assert.match(astroConfig, /outDir:\s*"\.\.\/blog"/);
	assert.doesNotMatch(astroConfig, /preprocess: vitePreprocess/);
	assert.match(siteConfig, /lang:\s*"id"/);
	assert.match(layout, /rel="canonical"/);
	assert.match(layout, /property="og:image"/);
	assert.match(layout, /name="twitter:image"/);
	assert.match(layout, /new URL\(url\("rss\.xml"\), siteRoot\)/);
	assert.match(robots, /new URL\("sitemap-index\.xml", blogRoot\)/);
});

test("post yang dipublikasikan mempunyai frontmatter, gambar, dan code fence yang valid", () => {
	const postsRoot = path.join(projectRoot, "src", "content", "posts");
	const posts = listMarkdownFiles(postsRoot).filter(
		(file) => !path.basename(file).startsWith("_"),
	);

	assert.ok(posts.length > 0, "setidaknya satu post harus tersedia");

	for (const postPath of posts) {
		const markdown = fs.readFileSync(postPath, "utf8");
		assert.match(markdown, /^---\n[\s\S]+?\n---\n/);
		assert.match(markdown, /\ndescription:\s*"[^\n]+"/);
		assert.match(markdown, /\ndraft:\s*false/);
		assert.match(markdown, /\nlang:\s*"(?:id|en|ja|zh)"/);

		const fences = markdown.match(/^```/gm) ?? [];
		assert.equal(
			fences.length % 2,
			0,
			`code fence tidak berpasangan: ${path.relative(projectRoot, postPath)}`,
		);

		for (const match of markdown.matchAll(/!\[([^\]]*)\]\((\.\/[^)]+)\)/g)) {
			const [, alt, relativeImage] = match;
			assert.ok(alt.trim(), `alt gambar kosong dalam ${postPath}`);
			assert.ok(
				fs.existsSync(path.resolve(path.dirname(postPath), relativeImage)),
				`gambar tidak ditemukan: ${relativeImage}`,
			);
		}
	}
});

test("pembuat post menolak path traversal dan membuat struktur folder yang aman", () => {
	const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "blog-new-post-"));
	const script = path.join(projectRoot, "scripts", "new-post.js");
	fs.mkdirSync(path.join(tempRoot, "src", "content", "posts"), {
		recursive: true,
	});

	try {
		const rejected = spawnSync(process.execPath, [script, "../keluar"], {
			cwd: tempRoot,
			encoding: "utf8",
		});
		assert.notEqual(rejected.status, 0);
		assert.equal(
			fs.existsSync(path.join(tempRoot, "src", "content", "keluar")),
			false,
		);

		const created = spawnSync(process.execPath, [script, "catatan-astro"], {
			cwd: tempRoot,
			encoding: "utf8",
		});
		assert.equal(created.status, 0, created.stderr);

		const generated = fs.readFileSync(
			path.join(
				tempRoot,
				"src",
				"content",
				"posts",
				"catatan-astro",
				"index.md",
			),
			"utf8",
		);
		assert.match(generated, /title: "Catatan Astro"/);
		assert.match(generated, /draft: true/);
		assert.match(generated, /lang: "id"/);
	} finally {
		fs.rmSync(tempRoot, { recursive: true, force: true });
	}
});

test("CI dan Dependabot blog berada di root repository", () => {
	const workflow = fs.readFileSync(
		path.join(repoRoot, ".github", "workflows", "blog-ci.yml"),
		"utf8",
	);
	const dependabot = fs.readFileSync(
		path.join(repoRoot, ".github", "dependabot.yml"),
		"utf8",
	);
	const packageJson = JSON.parse(read("package.json"));

	assert.match(workflow, /working-directory: blog-fuwari/);
	assert.match(workflow, /pnpm install --frozen-lockfile/);
	assert.match(workflow, /pnpm verify:committed-output/);
	assert.match(dependabot, /directory: \/blog-fuwari/);
	assert.equal(packageJson.packageManager, "pnpm@11.21.0");
	assert.equal(
		packageJson.scripts["verify:committed-output"],
		"node scripts/verify-committed-blog.mjs",
	);
	assert.doesNotMatch(packageJson.scripts.lint, /--write/);
	assert.doesNotMatch(workflow, /git diff --exit-code -- blog/);
	assert.equal(
		fs.existsSync(path.join(projectRoot, ".github", "workflows", "build.yml")),
		false,
	);
	assert.equal(
		fs.existsSync(path.join(projectRoot, ".github", "workflows", "biome.yml")),
		false,
	);
	assert.equal(
		fs.existsSync(path.join(projectRoot, ".github", "dependabot.yml")),
		false,
	);
});

test("verifikasi output hanya menormalisasi UID Astro dan indeks Pagefind turunannya", () => {
	const before = [
		'<astro-island uid="lokal" component-url="/blog/_astro/Search.js">',
		'<main data-value="tetap">Konten</main>',
	].join("");
	const after = before.replace('uid="lokal"', 'uid="ci"');

	assert.equal(normalizeGeneratedHtml(before), normalizeGeneratedHtml(after));
	assert.notEqual(
		normalizeGeneratedHtml(before),
		normalizeGeneratedHtml(before.replace("Konten", "Berubah")),
	);
	assert.equal(
		isVolatilePagefindPath("blog/_pagefind/index/id_test.pf_index"),
		true,
	);
	assert.equal(isVolatilePagefindPath("blog/_pagefind/pagefind.js"), false);
	assert.equal(isVolatilePagefindPath("blog/index.html"), false);
});

test("toolchain blog menggunakan versi aman dan migrasi konten Astro terbaru", () => {
	const packageJson = JSON.parse(read("package.json"));
	const astroConfig = read("astro.config.mjs");
	const contentConfig = read("src/content.config.ts");

	assert.equal(packageJson.dependencies.astro, "7.2.4");
	assert.equal(packageJson.dependencies["@astrojs/svelte"], "9.0.1");
	assert.equal(packageJson.dependencies["@astrojs/markdown-remark"], "7.2.4");
	assert.equal(packageJson.dependencies["@astrojs/tailwind"], undefined);
	assert.match(packageJson.dependencies.tailwindcss, /^\^3\./);
	assert.match(packageJson.dependencies.typescript, /^\^5\./);
	assert.match(read("pnpm-workspace.yaml"), /serialize-javascript:\s*7\.0\.5/);
	assert.match(packageJson.scripts.verify, /pnpm run doctor/);
	assert.match(packageJson.scripts.test, /pnpm run test:source/);
	assert.match(astroConfig, /processor:\s*unified\(/);
	assert.match(contentConfig, /loader:\s*glob\(/);
	assert.equal(
		fs.existsSync(path.join(projectRoot, "src", "content", "config.ts")),
		false,
	);
});
