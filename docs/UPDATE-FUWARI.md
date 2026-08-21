# Update Fuwari Tanpa Merusak Kustomisasi

## Prinsip utama
- `/blog-fuwari` adalah source template (vendor) yang sudah dikustom.
- `/blog` adalah output build. **Jangan edit manual**.

## MUST-KEEP (wajib dipertahankan untuk repo ini)
**Konfigurasi dan script:**
- `blog-fuwari/src/config.ts`
- `blog-fuwari/astro.config.mjs`
- `blog-fuwari/package.json` (scripts prebuild/build/doctor)
- `blog-fuwari/scripts/clean-blog-outdir.mjs`
- `blog-fuwari/scripts/ensure-blog-nojekyll.mjs`
- `blog-fuwari/scripts/doctor.mjs`

**Halaman dan util yang sudah dikustom:**
- `blog-fuwari/src/pages/[...page].astro`
- `blog-fuwari/src/pages/archive.astro`
- `blog-fuwari/src/pages/posts/[...slug].astro`
- `blog-fuwari/src/utils/content-utils.ts`

**Konten blog:**
- `blog-fuwari/src/content/spec/about.md`
- `blog-fuwari/src/content/posts/**` (semua post + `_TEMPLATE.md`)

**Asset public:**
- `blog-fuwari/public/assets/images/banner.webp`
- `blog-fuwari/public/assets/images/avatar.jpg` (jika dipakai)
- `blog-fuwari/public/favicon/icon.png`

**Root repo:**
- `.nojekyll`
- `README.md`
- `docs/**`
- `package.json` (script blog:dev/blog:build/blog:doctor)

## Metode 1 (rekomendasi): Replace manual yang aman
1) Backup folder `blog-fuwari` ke tempat lain.
2) Ambil template Fuwari terbaru (zip) ke folder sementara.
3) Replace isi `blog-fuwari` dengan versi terbaru.
4) Kembalikan semua file pada daftar MUST-KEEP.
5) Jalankan:
   ```bash
   cd blog-fuwari
   pnpm install
   pnpm doctor
   pnpm build
   ```
6) Verifikasi hasil di `/blog`.

## Metode 2 (opsional): Workflow git upstream
1) Tambah remote upstream:
   ```bash
   git remote add upstream https://github.com/saicaca/fuwari.git
   git fetch upstream
   ```
2) Tarik perubahan upstream ke branch sementara.
3) Sync isi `/blog-fuwari` dengan upstream.
4) Restore semua file pada daftar MUST-KEEP.
5) Jalankan `pnpm install`, `pnpm doctor`, `pnpm build`.

## Cara mengetahui perubahan upstream
Gunakan diff sederhana dari folder sementara:
```bash
diff -qr fuwari-upstream/ blog-fuwari/
```
Atau bandingkan file tertentu dengan `git diff`.

## Checklist setelah update
- [ ] `pnpm install` (di `blog-fuwari`)
- [ ] `pnpm doctor`
- [ ] `pnpm build`
- [ ] `/blog/.nojekyll` ada
- [ ] `blog/assets/images/banner.webp` ada
- [ ] `blog/favicon/icon.png` ada
- [ ] Post dan halaman tampil normal
