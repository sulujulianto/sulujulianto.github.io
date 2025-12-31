# Troubleshooting

Panduan ini fokus pada masalah umum blog dan output build.

## Blog tidak ter-update / postingan lama masih muncul
**Penyebab:** output `/blog` belum dibersihkan atau build belum dijalankan.
**Solusi:**
```bash
npm run blog:build
```
Build ini otomatis membersihkan `/blog` sebelum membuat output baru.

## Favicon atau banner tidak berubah
**Penyebab:** cache browser sangat agresif.
**Solusi cepat:**
- Hard refresh (Ctrl+Shift+R) atau buka incognito.
- Jika masih sama, ganti nama file (misal `icon-v2.png`) lalu update `siteConfig.favicon`.
- Pastikan file ada di:
  - `blog-fuwari/public/assets/images/banner.webp`
  - `blog-fuwari/public/favicon/icon.png`

## pnpm permission error
**Solusi A (disarankan):**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```
Jika permission error:
```bash
sudo corepack enable
```
**Solusi B (alternatif):**
```bash
sudo npm i -g pnpm
```

## Astro TS config tidak ditemukan
**Solusi:**
```bash
cd blog-fuwari
pnpm install
```
Lalu restart TypeScript Server di VSCode.

## Asset 404 di GitHub Pages
**Cek hal berikut:**
- `astro.config.mjs` punya `base: "/blog/"`.
- `.nojekyll` ada di root repo.
- `/blog/.nojekyll` dibuat otomatis saat build.

## Search tidak bekerja (Pagefind)
**Penyebab:** output `_pagefind` tidak dibuat.
**Solusi:**
- Pastikan script build:
  `astro build && pagefind --site ../blog --output-subdir _pagefind`
- Jalankan ulang:
```bash
npm run blog:build
```
- Pastikan folder `blog/_pagefind` ada.

## Cara cek kondisi blog (doctor)
```bash
npm run blog:doctor
```
Doctor memeriksa:
- konfigurasi base dan outDir
- script build dan prebuild
- banner dan favicon
- `.nojekyll` root dan output
- status node_modules tracking
