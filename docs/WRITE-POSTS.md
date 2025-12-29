# Cara Membuat Postingan (Rapi, Ada Cover, Gambar, Multi Bahasa)

## Lokasi post
Semua post berada di:
```
blog-fuwari/src/content/posts/
```

## Rekomendasi struktur (1 folder per post)
```
blog-fuwari/src/content/posts/nama-slug/
  index.md
  cover.webp
  gambar-1.webp
```

## Contoh frontmatter lengkap
```md
---
title: "Judul Postingan"
published: 2025-01-01
updated: 2025-01-02
description: "Ringkasan singkat isi postingan."
image: "./cover.webp"
tags: ["Blog", "Tutorial"]
category: "General"
draft: false
lang: "id"
---
```

## Tentang lang
- `lang` dipakai untuk menandai bahasa konten (mis: id, en, ja, zh).
- Disarankan konsisten untuk setiap post.
- Jika ingin bahasa sebagai tag juga, gunakan pola seperti `lang:id` di tags.

## Cara menaruh cover
- Jika cover berada di folder post: `image: "./cover.webp"`
- Jika cover di public: `image: "/assets/covers/nama-file.webp"`

## Gambar di isi post
Gunakan relative path (direkomendasikan):
```md
![Contoh gambar](./gambar-1.webp)
```

## Contoh code block
```ts
const message = "Halo blog";
console.log(message);
```

## Draft (tidak ikut build)
- Set `draft: true` untuk menyembunyikan post.
- File yang diawali underscore tidak ikut build, misalnya `_TEMPLATE.md`.

## Setelah menulis
```bash
cd blog-fuwari
pnpm build
```

## Tips
- Pakai slug yang aman: huruf kecil, tanpa spasi, pakai tanda minus.
- Gunakan format gambar webp agar ringan.
- Favicon dan banner sering cache, hard refresh jika tidak berubah.
