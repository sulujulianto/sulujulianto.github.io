# Mengelola Blog

Panduan ini menjelaskan arsitektur, toolchain, dan alur pemeliharaan blog. Gunakan [WRITE-POSTS.md](WRITE-POSTS.md) saat menulis artikel dan [UPDATE-FUWARI.md](UPDATE-FUWARI.md) saat memperbarui template atau dependency.

## Arsitektur

Blog mempunyai dua direktori dengan fungsi berbeda:

| Direktori | Fungsi | Boleh diedit manual? |
| --- | --- | --- |
| `blog-fuwari/` | Source Astro, komponen, konfigurasi, artikel, dan pengujian. | Ya. |
| `blog/` | Hasil build statis yang diterbitkan GitHub Pages. | Tidak. |

Setiap perubahan dimulai dari `blog-fuwari/`. Perintah build membersihkan dan membuat ulang `blog/`, kemudian Pagefind membangun indeks pencarian.

## Toolchain

- Node.js mengikuti `.nvmrc`, yaitu major 24.
- pnpm dipin ke 11.21.0 dalam `blog-fuwari/package.json`.
- Astro 7 menghasilkan halaman statis dan memakai Content Layer API.
- Svelte 5 digunakan untuk komponen interaktif.
- Tailwind CSS 3 mengatur tampilan melalui PostCSS. Integrasi lama
  `@astrojs/tailwind` tidak dipakai karena tidak kompatibel dengan Astro 7.
- Pagefind menyediakan pencarian statis.
- Biome memeriksa format dan kualitas source.

Aktifkan versi yang sesuai sebelum memasang dependency:

```bash
nvm use
corepack enable
corepack prepare pnpm@11.21.0 --activate
cd blog-fuwari
pnpm install --frozen-lockfile
```

Jangan memakai npm untuk memasang dependency dalam `blog-fuwari/`. Root portfolio tetap menggunakan npm; blog menggunakan pnpm.

## Perintah penting

Jalankan dari `blog-fuwari/`:

| Perintah | Kegunaan |
| --- | --- |
| `pnpm dev` | Menjalankan server pengembangan. |
| `pnpm doctor` | Memastikan konfigurasi dan lokasi output aman. |
| `pnpm format:check` | Memeriksa format tanpa mengubah file. |
| `pnpm lint` | Memeriksa source tanpa menulis ulang file. |
| `pnpm check` | Menjalankan pemeriksaan Astro dan TypeScript. |
| `pnpm test:source` | Menguji konfigurasi, artikel, script, dan CI. |
| `pnpm build` | Membangun ulang `../blog/` dan indeks Pagefind. |
| `pnpm test:output` | Memeriksa hasil build, SEO, RSS, sitemap, dan aset. |
| `pnpm verify` | Menjalankan doctor, Astro check, pengujian, dan build. |
| `pnpm verify:committed-output` | Membandingkan hasil build stabil dengan commit dan memvalidasi indeks Pagefind. |
| `pnpm audit --prod` | Memeriksa seluruh tingkat kerentanan dependency produksi. |

Dari root repository, perintah yang setara adalah `npm run blog:verify`.

## Alur perubahan

1. Sinkronkan `main` dan buat branch khusus.
2. Pastikan `git status --short --branch` bersih.
3. Ubah hanya file source dalam `blog-fuwari/` dan dokumentasi terkait.
4. Jalankan `pnpm format:check`, `pnpm lint`, dan `pnpm verify` dari `blog-fuwari/`.
5. Tinjau perubahan source dan hasil build `blog/`.
6. Jalankan `pnpm audit --prod` dan `git diff --check`. Audit harus bersih;
   jangan hanya mengandalkan ambang `high` karena kerentanan `low` dan
   `moderate` tetap perlu ditinjau.
7. Stage hanya file yang telah ditinjau.
8. Buat Pull Request dan tunggu Portfolio CI, Blog CI, serta deployment selesai.

## Pemeriksaan hasil build

Setelah `pnpm build`, pastikan:

- `blog/.nojekyll` tersedia;
- canonical setiap halaman menggunakan `/blog/`;
- `blog/rss.xml` dan `blog/robots.txt` menunjuk URL blog;
- `blog/sitemap-0.xml` memuat semua halaman terbit;
- `blog/_pagefind/` tersedia;
- tidak ada perubahan portfolio yang ikut terbawa.

Gunakan:

```bash
git diff --check
git diff --stat
git status --short --branch
```

Jangan melakukan staging seluruh repository sekaligus. Stage file source, dokumentasi, dan hasil build yang memang menjadi bagian pekerjaan.

## Otomatisasi GitHub

`.github/workflows/blog-ci.yml` menjalankan instalasi terkunci, verifikasi source, build, audit produksi, dan perbandingan semantik hasil `blog/` dengan commit. UID internal Astro dinormalisasi karena dapat berbeda antarlingkungan, sedangkan HTML lainnya, aset stabil, daftar file, dan kelengkapan Pagefind tetap diperiksa. `.github/dependabot.yml` memantau patch dan minor dependency blog setiap minggu; upgrade mayor tetap harus direncanakan terpisah.

Konfigurasi `.github` yang diletakkan di dalam `blog-fuwari/` tidak dijalankan GitHub karena direktori tersebut bukan root repository.

## Batas tanggung jawab

Perubahan blog tidak boleh sekaligus mengubah data, halaman, atau hasil build portfolio. Pengecualian hanya konfigurasi root yang secara langsung menjalankan pemeriksaan blog, seperti workflow dan script `blog:*`.
