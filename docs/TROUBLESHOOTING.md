# Troubleshooting Portfolio dan Blog

Mulai dari pemeriksaan umum:

```bash
git status --short --branch
npm ci
npm run verify
```

## Portfolio hanya menampilkan loading atau data kosong

Penyebab paling umum adalah halaman dibuka melalui `file://`.

Jalankan server lokal:

```bash
python3 -m http.server 8080
```

Buka <http://localhost:8080/> dan lihat Console/Network pada Browser DevTools jika masalah berlanjut.

## Perubahan CSS tidak muncul

Jangan edit `assets/css/output.css` manual. Edit `assets/css/main.css` atau class Tailwind di HTML/TSX, lalu:

```bash
npm run tailwind:build
```

Lakukan hard refresh (`Ctrl+Shift+R`). Pastikan `git diff -- assets/css/output.css` menunjukkan hasil build baru.

## Perubahan TypeScript tidak muncul

File browser berada di `assets/js/dist/`. Setelah mengubah source `.ts` atau `.tsx`, jalankan:

```bash
npm run ts:build
```

Jangan memperbaiki masalah dengan mengedit file `dist` langsung.

## Teks terjemahan menghilang

Biasanya key `data-i18n` di HTML tidak cocok dengan katalog locale atau tipe key berbeda antarbahasa.

Periksa:

- `assets/data/locales/ui-id.json`
- `assets/data/locales/ui-en.json`
- `assets/data/locales/ui-ja.json`
- `assets/data/locales/ui-zh.json`

Kemudian jalankan:

```bash
npm run test:ui-locale
```

Semua katalog harus memiliki key, urutan, dan tipe nilai yang sama.

## Audit gagal setelah mengubah proyek atau sertifikat

Audit sengaja membandingkan data dengan snapshot. Pertama tinjau perubahan:

```bash
git diff -- assets/data assets/img
```

Jika perubahan memang benar dan lengkap:

```bash
npm run audit:baseline:update
git diff -- tests/fixtures/portfolio-data-baseline.json
npm run verify
```

Jangan menerima baseline jika kegagalan berasal dari typo, kategori tidak valid, atau aset yang lupa ditambahkan.

## Audit menampilkan tiga warning gambar proyek

Warning berikut sudah dikenal:

- `antriankku.webp`
- `kospintar.webp`
- `lokerkita.webp`

Ketiganya bukan failure. Jika gambar sudah tersedia, tambahkan file, hapus path dari `EXPECTED_KNOWN_MISSING_ASSETS`, lalu perbarui baseline.

## Gambar proyek atau sertifikat rusak

- Periksa huruf besar/kecil pada nama file; GitHub Pages bersifat case-sensitive.
- Pastikan ekstensi pada JSON cocok dengan file.
- Gunakan path sesuai contoh pada [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md).
- Jalankan `npm run audit:portfolio`.

## Detail proyek membuka 404

Ini normal untuk proyek `in-development`. Untuk proyek `published`, pastikan tersedia:

- `slug` pada kartu;
- `projects/<slug>/index.html`;
- `assets/data/project-details/<bahasa>/<slug>.json`;
- gambar yang dirujuk artikel;
- entri `sitemap.xml`.

Jalankan:

```bash
npm run test:projects
```

## Social preview belum berubah

Platform sosial menyimpan cache cukup lama.

- Pastikan `assets/img/social/portfolio-preview.png` sudah diekspor ulang pada ukuran 1200 × 630.
- Buka URL gambar langsung dan pastikan file baru sudah ter-deploy.
- Periksa metadata `og:image` dan `twitter:image` pada tiga halaman root.
- Gunakan debugger resmi platform terkait untuk meminta pembacaan ulang bila tersedia.

## Blog tidak diperbarui atau postingan lama masih muncul

Build ulang dari source:

```bash
npm run blog:build
```

Build membersihkan output `blog/` terlebih dahulu. Jangan edit output tersebut manual.

## Favicon atau banner blog tidak berubah

- Lakukan hard refresh atau buka incognito.
- Pastikan source ada di `blog-fuwari/public/`.
- Jalankan `npm run blog:build`.
- Periksa hasilnya di `blog/favicon/` dan `blog/assets/images/`.

## pnpm atau dependency blog bermasalah

Aktifkan versi yang dikunci:

```bash
corepack enable
corepack prepare pnpm@9.14.4 --activate
cd blog-fuwari
pnpm install --frozen-lockfile
cd ..
```

## Search blog tidak bekerja

Pagefind dibuat saat build:

```bash
npm run blog:build
```

Pastikan folder `blog/_pagefind/` tersedia dan `npm run blog:doctor` lulus.

## Git menolak penghapusan branch

Gunakan penghapusan aman:

```bash
git branch -d nama-branch
```

Jika ditolak, branch mungkin belum tergabung. Jangan memakai `-D` sebelum memeriksa commit dan Pull Request.
