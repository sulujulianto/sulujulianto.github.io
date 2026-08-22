# Menulis dan Menerbitkan Postingan Blog

## 1. Mulai dari branch bersih

Dari root repository:

```bash
git switch main
git pull --ff-only origin main
git status --short --branch
git switch -c blog/judul-singkat
```

Gunakan satu branch untuk satu postingan atau satu kelompok perubahan yang berkaitan.

## 2. Buat folder postingan

Setiap postingan disarankan memakai satu folder:

```text
blog-fuwari/src/content/posts/judul-postingan/
├── index.md
├── cover.webp
└── images/
    └── screenshot.webp
```

Nama folder memakai huruf kecil, angka, dan tanda minus.

## 3. Tulis frontmatter

Gunakan struktur berikut pada `index.md`:

```md
---
title: "Judul Postingan"
published: 2026-01-01
updated: 2026-01-02
description: "Ringkasan singkat isi postingan."
image: "./cover.webp"
tags: ["Blog", "Tutorial", "lang:id"]
category: "General"
draft: true
lang: "id"
---
```

Aturan:

- hapus `updated` jika belum pernah diperbarui;
- `image` opsional, tetapi disarankan;
- gunakan `draft: true` selama menulis;
- gunakan `lang: id`, `en`, `ja`, atau `zh`;
- gunakan tanggal nyata, bukan tanggal perkiraan.

## 4. Tambahkan gambar

Gambar dalam folder artikel menggunakan path relatif:

```md
![Deskripsi gambar](./images/screenshot.webp)
```

Setiap gambar harus mempunyai deskripsi yang bermakna. Kompres gambar besar ke WebP jika memungkinkan.

## 5. Jalankan mode pengembangan

```bash
cd blog-fuwari
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Buka URL yang ditampilkan Astro. Karena `draft: true`, artikel dapat diperiksa pada mode pengembangan tanpa ikut diterbitkan.

## 6. Periksa isi artikel

Periksa:

1. judul dan deskripsi;
2. heading berurutan;
3. tautan dapat dibuka;
4. gambar dan teks alternatif benar;
5. code block mudah dibaca;
6. tampilan desktop dan mobile;
7. informasi pribadi atau rahasia tidak ikut tertulis.

## 7. Terbitkan dan bangun output

Ubah `draft: true` menjadi `draft: false`, lalu:

```bash
pnpm build
pnpm doctor
```

Pastikan halaman artikel muncul pada output `../blog/posts/`.

## 8. Tinjau perubahan

Kembali ke root repository:

```bash
cd ..
git diff --check
git diff --stat
git status --short --branch
```

Tinjau source postingan, gambar, dan perubahan output `blog/`. Jangan mengedit HTML atau CSS dalam `blog/` secara manual.

## 9. Stage dan commit secara eksplisit

Ganti path contoh dengan path artikel sebenarnya:

```bash
git add -- \
  blog-fuwari/src/content/posts/judul-postingan \
  blog

git diff --cached --check
git diff --cached --stat
git commit -m "blog: publish judul postingan"
```

Sebelum push, jalankan [Checklist Publikasi Blog](CHECKLIST-PUBLIKASI.md).
