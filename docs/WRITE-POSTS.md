# Cara Membuat Postingan (Rapi, Ada Cover, Multi Bahasa)

## Lokasi post
Semua postingan berada di:
```
blog-fuwari/src/content/posts/
```

## Rekomendasi struktur (1 folder per post)
Contoh struktur yang rapi:
```
blog-fuwari/src/content/posts/my-first-post/
  index.md
  cover.webp
  images/
    diagram.webp
    screenshot.webp
```

## Template frontmatter lengkap (copy-paste)
```md
---
title: "Judul Postingan"
published: 2025-01-01
updated: 2025-01-02
description: "Ringkasan singkat isi postingan."
image: "./cover.webp"
tags: ["Blog", "Tutorial", "lang:id"]
category: "General"
draft: false
lang: "id"
---
```
Catatan:
- `updated` opsional, boleh dihapus jika tidak dipakai.
- `image` opsional, tetapi disarankan untuk cover.
- `draft: true` menyembunyikan postingan dari build.

## Tentang `lang`
- `lang` menandai bahasa konten: `id`, `en`, `ja`, `zh`.
- Konsisten gunakan `lang` agar metadata rapi.
- Jika ingin bahasa juga muncul sebagai tag, gunakan pola `lang:id`.

## Aturan cover image
- Simpan cover di folder post, lalu referensikan:
  - `image: "./cover.webp"`
- Alternatif (public): simpan di `blog-fuwari/public/assets/covers/` lalu referensikan:
  - `image: "/assets/covers/nama-file.webp"`

## Gambar di isi post
Gunakan path relatif dari folder post:
```md
![Contoh gambar](./images/diagram.webp)
```

## Contoh code block
```js
const title = "Halo Blog";
console.log(title);
```

```ts
type Post = { title: string; published: string };
const post: Post = { title: "Contoh", published: "2025-01-01" };
```

```bash
npm run blog:build
```

## Draft workflow
- Gunakan `draft: true` agar tidak muncul di listing.
- File yang diawali underscore tidak ikut build (misal `_TEMPLATE.md`).

## Setelah menulis
```bash
npm run blog:build
```

## Kesalahan umum + solusi cepat
- **Path gambar salah**: pastikan path relatif `./` sesuai folder post.
- **Lupa build**: jalankan `npm run blog:build` setelah menambah post.
- **Draft masih true**: ubah ke `false` sebelum publish.
- **Slug tidak aman**: gunakan huruf kecil, angka, dan tanda minus.
- **Gambar terlalu besar**: kompres ke WebP (lebih ringan di web).
