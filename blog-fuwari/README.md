# Source Blog Sulu Edward Julianto

Direktori ini berisi source blog berbasis [Astro 7](https://astro.build/) dan [Fuwari](https://github.com/saicaca/fuwari). Hasil build diterbitkan ke `../blog/` melalui GitHub Pages.

## Menjalankan secara lokal

```bash
nvm use
corepack enable
corepack prepare pnpm@11.21.0 --activate
cd blog-fuwari
pnpm install --frozen-lockfile
pnpm dev
```

## Verifikasi lengkap

```bash
pnpm format:check
pnpm lint
pnpm verify
pnpm audit --prod
```

Rangkaian tersebut memeriksa konfigurasi, format, lint, Astro, source artikel, hasil build, SEO, RSS, sitemap, Pagefind, referensi aset lokal, dan seluruh tingkat kerentanan dependency produksi.

## Aturan penting

- Ubah source dalam direktori ini; jangan edit `../blog/` secara manual.
- Gunakan pnpm 11.21.0 sebagaimana dipin dalam `package.json`.
- Buat artikel melalui `pnpm new-post <slug>`.
- Jalankan build dan commit perubahan `../blog/` bersama source.
- Workflow GitHub aktif berada di `../.github/workflows/blog-ci.yml`, bukan dalam direktori ini.

Panduan lengkap tersedia di:

- [Mengelola blog](../docs/MENGELOLA-BLOG.md)
- [Menulis postingan](../docs/WRITE-POSTS.md)
- [Memperbarui Fuwari dan dependency](../docs/UPDATE-FUWARI.md)

Fuwari menggunakan lisensi MIT. Artikel, foto, dan aset pribadi tetap mengikuti hak serta lisensi yang dicantumkan oleh pemilik repository.
