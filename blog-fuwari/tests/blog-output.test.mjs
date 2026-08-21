import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = path.resolve(projectRoot, "..");
const outputRoot = path.join(repoRoot, "blog");
const publicOrigin = "https://sulujulianto.github.io";

function listFiles(directory, extension) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return listFiles(fullPath, extension);
		return entry.isFile() && entry.name.endsWith(extension) ? [fullPath] : [];
	});
}

function routeForHtml(filePath) {
	const relative = path.relative(outputRoot, filePath).replace(/\\/g, "/");
	if (relative === "index.html") return "/blog/";
	return `/blog/${relative.replace(/index\.html$/, "")}`;
}

test("setiap halaman HTML memiliki canonical dan metadata sosial absolut", () => {
	const htmlFiles = listFiles(outputRoot, ".html");
	assert.ok(htmlFiles.length >= 4, "hasil build HTML blog belum lengkap");

	for (const filePath of htmlFiles) {
		const html = fs.readFileSync(filePath, "utf8");
		const canonical = `${publicOrigin}${routeForHtml(filePath)}`;

		assert.match(html, /<html lang="id"/);
		assert.ok(
			html.includes(`<link rel="canonical" href="${canonical}">`),
			`canonical salah dalam ${path.relative(outputRoot, filePath)}`,
		);
		assert.match(html, /<meta property="og:image" content="https:\/\//);
		assert.match(html, /<meta name="twitter:image" content="https:\/\//);
	}
});

test("gambar utama mempunyai teks alternatif dan dimensi intrinsik", () => {
	const home = fs.readFileSync(path.join(outputRoot, "index.html"), "utf8");
	const post = fs.readFileSync(
		path.join(outputRoot, "posts", "recap-2025", "index.html"),
		"utf8",
	);

	assert.match(
		home,
		/<img[^>]+src="\/blog\/assets\/images\/banner\.webp"[^>]+width="1200"[^>]+height="848"/,
	);
	assert.match(
		home,
		/<img[^>]+src="\/blog\/assets\/images\/avatar\.jpg"[^>]+width="400"[^>]+height="400"/,
	);
	assert.match(
		post,
		/alt="Cover artikel Recap 2025: Mengubah Niat Jadi Bukti"/,
	);
});

test("RSS dan robots menggunakan URL /blog yang benar", () => {
	const rss = fs.readFileSync(path.join(outputRoot, "rss.xml"), "utf8");
	const robots = fs.readFileSync(path.join(outputRoot, "robots.txt"), "utf8");

	assert.match(rss, /<link>https:\/\/sulujulianto\.github\.io\/blog\/<\/link>/);
	assert.match(rss, /<language>id<\/language>/);
	assert.doesNotMatch(rss, /src=&quot;\.\/images\//);
	assert.equal(
		robots,
		"User-agent: *\nAllow: /\n\nSitemap: https://sulujulianto.github.io/blog/sitemap-index.xml",
	);
});

test("sitemap, Pagefind, dan .nojekyll tersedia", () => {
	const sitemap = fs.readFileSync(
		path.join(outputRoot, "sitemap-0.xml"),
		"utf8",
	);
	const expectedRoutes = [
		"https://sulujulianto.github.io/blog/",
		"https://sulujulianto.github.io/blog/about/",
		"https://sulujulianto.github.io/blog/archive/",
		"https://sulujulianto.github.io/blog/posts/recap-2025/",
	];

	for (const route of expectedRoutes) {
		assert.ok(
			sitemap.includes(`<loc>${route}</loc>`),
			`sitemap tidak memuat ${route}`,
		);
	}

	assert.ok(fs.existsSync(path.join(outputRoot, ".nojekyll")));
	assert.ok(
		fs.existsSync(path.join(outputRoot, "_pagefind", "pagefind-entry.json")),
	);
});

test("seluruh referensi halaman dan aset lokal dapat ditemukan", () => {
	const broken = [];
	let checked = 0;

	for (const filePath of listFiles(outputRoot, ".html")) {
		const html = fs.readFileSync(filePath, "utf8");
		const pageUrl = new URL(routeForHtml(filePath), publicOrigin);

		for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
			const reference = match[1];
			if (
				reference.startsWith("#") ||
				reference.startsWith("data:") ||
				reference.startsWith("mailto:") ||
				reference.startsWith("javascript:")
			) {
				continue;
			}

			const resolved = new URL(reference, pageUrl);
			if (
				resolved.origin !== publicOrigin ||
				!resolved.pathname.startsWith("/blog/")
			) {
				continue;
			}

			checked += 1;
			let target = path.join(repoRoot, decodeURIComponent(resolved.pathname));
			if (resolved.pathname.endsWith("/"))
				target = path.join(target, "index.html");
			if (!fs.existsSync(target)) {
				broken.push(
					`${path.relative(outputRoot, filePath)} -> ${resolved.pathname}`,
				);
			}
		}
	}

	assert.ok(checked > 100, "jumlah referensi yang diperiksa terlalu sedikit");
	assert.deepEqual(broken, []);
});
