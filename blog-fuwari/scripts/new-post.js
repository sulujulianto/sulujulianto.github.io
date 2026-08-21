import fs from "node:fs";
import path from "node:path";

function getDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

const args = process.argv.slice(2);

if (args.length !== 1) {
	console.error(
		"Penggunaan: pnpm new-post <slug>\nContoh: pnpm new-post catatan-belajar-astro",
	);
	process.exit(1);
}

const slug = args[0].trim();
const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!safeSlug.test(slug)) {
	console.error(
		"Slug tidak valid. Gunakan huruf kecil, angka, dan tanda minus tanpa path atau ekstensi.",
	);
	process.exit(1);
}

const postsRoot = path.resolve(process.cwd(), "src", "content", "posts");
const postDirectory = path.join(postsRoot, slug);
const fullPath = path.join(postDirectory, "index.md");

if (path.relative(postsRoot, postDirectory).startsWith("..")) {
	throw new Error(`Menolak path postingan di luar ${postsRoot}`);
}

if (fs.existsSync(postDirectory)) {
	console.error(`Postingan sudah tersedia: ${postDirectory}`);
	process.exit(1);
}

const title = slug
	.split("-")
	.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
	.join(" ");

const content = `---
title: ${JSON.stringify(title)}
published: ${getDate()}
description: ""
image: ""
tags: ["lang:id"]
category: "General"
draft: true
lang: "id"
---

Tulis pembuka yang menjelaskan konteks dan tujuan artikel.
`;

fs.mkdirSync(postDirectory, { recursive: false });
fs.writeFileSync(fullPath, content, { encoding: "utf8", flag: "wx" });

console.log(`Postingan dibuat: ${fullPath}`);
