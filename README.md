# sulujulianto.github.io

Repo ini berisi:
- Portfolio statis di root.
- Blog statis di `/blog` yang dihasilkan dari source di `/blog-fuwari`.

## Struktur folder
- `/` : portfolio (jangan diubah struktur/format tanpa perlu)
- `/blog` : output build blog (jangan edit manual)
- `/blog-fuwari` : source blog (Astro + Fuwari)
- `/docs` : dokumentasi pemeliharaan

## Quick commands (blog)
Dari root repo:
```bash
npm run blog:dev
npm run blog:build
npm run blog:doctor
```
Atau langsung:
```bash
cd blog-fuwari
pnpm dev
pnpm build
pnpm doctor
```

## Cara menambah post
Ringkasnya: buat file markdown baru di `blog-fuwari/src/content/posts/` lalu build.
Panduan lengkap: `docs/WRITE-POSTS.md`.

## Update Fuwari
Panduan aman update template ada di: `docs/UPDATE-FUWARI.md`.

## Banner & favicon
- Banner: `blog-fuwari/public/assets/images/banner.webp`
- Favicon: `blog-fuwari/public/favicon/icon.png`
Catatan: favicon sering cache, lakukan hard refresh bila belum berubah.

## Recovery / setup ulang
Lihat `docs/SETUP-BARU.md`.
