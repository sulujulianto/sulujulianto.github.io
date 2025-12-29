# Update Fuwari (Fork/Upstream) Tanpa Merusak Kustomisasi

## Konsep
Folder `/blog-fuwari` adalah source vendor dari template Fuwari. Semua kustomisasi berada di sini dan hasil build berada di `/blog`.

## File kustom yang harus dipertahankan
- `blog-fuwari/src/config.ts`
- `blog-fuwari/src/content/spec/about.md`
- `blog-fuwari/src/content/posts/` (postingan Anda)
- `blog-fuwari/astro.config.mjs`
- `blog-fuwari/package.json` (scripts build, prebuild, doctor, clean)
- `blog-fuwari/public/assets/images/banner.webp`
- `blog-fuwari/public/favicon/icon.png`

## Metode 1 (GitHub UI)
1) Buka repo Fuwari Anda (fork) di GitHub.
2) Klik "Sync fork" untuk update dari upstream.
3) Download zip terbaru.
4) Ganti isi `/blog-fuwari` dengan versi baru.
5) Kembalikan file kustom (lihat daftar di atas).
6) Jalankan `pnpm install` dan `pnpm build`.

## Metode 2 (Git)
1) Tambahkan upstream:
```bash
git remote add upstream https://github.com/saicaca/fuwari.git
```
2) Ambil update:
```bash
git fetch upstream
```
3) Update folder blog-fuwari (manual copy dari upstream atau merge branch).
4) Restore file kustom.
5) `pnpm install` lalu `pnpm build`.

## Cara aman merge
1) Backup file kustom ke tempat aman.
2) Update template Fuwari.
3) Restore file kustom.
4) `pnpm install`.
5) `pnpm build`.
6) Cek hasil di `/blog`.

## Checklist setelah update
- `blog-fuwari/astro.config.mjs` base dan outDir masih benar.
- `blog-fuwari/package.json` build masih menunjuk ke `../blog` + `_pagefind`.
- Banner dan favicon tampil di `/blog`.
- Blog bisa di-build tanpa error.
