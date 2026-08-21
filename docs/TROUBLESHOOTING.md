# Troubleshooting Portfolio

Mulai dari kondisi dasar:

```bash
nvm use
npm ci
npm run verify
git status --short --branch
```

Catat perintah yang gagal dan pesan error pertama. Jangan memperbaiki beberapa masalah sekaligus sebelum penyebab awal dipahami.

## Halaman hanya menampilkan loading atau data kosong

Penyebab paling umum adalah halaman dibuka melalui `file://`.

```bash
python3 -m http.server 8080
```

Buka <http://localhost:8080/>. Jika masalah berlanjut, periksa Console dan Network pada Browser DevTools untuk melihat JSON atau script yang gagal dimuat.

## Perubahan CSS tidak muncul

Edit `assets/css/main.css` atau class Tailwind pada HTML/TSX, lalu jalankan:

```bash
npm run tailwind:build
git diff -- assets/css/output.css
```

Lakukan hard refresh dengan `Ctrl+Shift+R`. Jangan memperbaiki masalah dengan mengedit `output.css` langsung.

## Perubahan TypeScript tidak muncul

```bash
npm run ts:build
git diff -- assets/js assets/js/dist
```

Browser memakai file dalam `assets/js/dist/`. Jika output tidak berubah, periksa apakah file source termasuk dalam `tsconfig.runtime.json`.

## Teks bahasa menghilang

Periksa:

```text
assets/data/locales/ui-id.json
assets/data/locales/ui-en.json
assets/data/locales/ui-ja.json
assets/data/locales/ui-zh.json
```

Kemudian jalankan:

```bash
npm run test:ui-locale
```

Biasanya key hilang, urutan key berbeda, tipe nilai berubah, atau atribut `data-i18n` tidak cocok dengan katalog.

## JSON tidak dapat dibaca

Validasi file tertentu:

```bash
node -e "JSON.parse(require('fs').readFileSync('path/file.json', 'utf8')); console.log('JSON valid')"
```

Periksa tanda kutip, koma terakhir, dan karakter yang tidak sengaja ditempel. Setelah itu jalankan audit atau test yang berkaitan.

## Audit gagal setelah mengubah data

Tinjau data dan aset terlebih dahulu:

```bash
git diff -- assets/data assets/img
npm run audit:portfolio
```

Jika perubahan benar dan lengkap:

```bash
npm run audit:baseline:update
git diff -- tests/fixtures/portfolio-data-baseline.json
npm run verify
```

Jangan memperbarui baseline jika kegagalan berasal dari typo, kategori tidak valid, atau aset yang belum ditambahkan.

## Audit menampilkan tiga warning gambar proyek

Warning berikut sudah dikenal:

- `antriankku.webp`;
- `kospintar.webp`;
- `lokerkita.webp`.

Ketiganya bukan failure. Jika gambarnya sudah tersedia, tambahkan file, hapus path terkait dari `EXPECTED_KNOWN_MISSING_ASSETS` dalam `scripts/audit-portfolio-data.mjs`, perbarui baseline, lalu jalankan verifikasi.

## Gambar proyek atau sertifikat rusak

- Periksa huruf besar dan kecil pada nama file.
- Pastikan ekstensi JSON sama dengan file sebenarnya.
- Pastikan path relatif dihitung dari halaman yang memuat dataset.
- Buka URL gambar langsung melalui server lokal.
- Jalankan `npm run audit:portfolio`.

GitHub Pages bersifat case-sensitive meskipun filesystem lokal tertentu mungkin tidak.

## Detail proyek membuka 404

Untuk proyek `in-development`, 404 dapat menjadi perilaku yang disengaja. Untuk proyek `published`, pastikan tersedia:

- slug pada kartu;
- `projects/<slug>/index.html`;
- `assets/data/project-details/<bahasa>/<slug>.json`;
- seluruh gambar artikel;
- entri pada `sitemap.xml`.

Kemudian jalankan:

```bash
npm run test:projects
```

## Social preview belum berubah

Platform sosial menyimpan cache.

- Pastikan PNG 1200 × 630 sudah diperbarui.
- Buka URL gambar publik secara langsung.
- Periksa `og:image` dan `twitter:image` pada halaman.
- Pastikan deployment terbaru sudah selesai.
- Gunakan debugger resmi platform untuk meminta pembacaan ulang.

## Pengujian browser Playwright gagal sekali

Jangan langsung mengubah kode. Jalankan test terfokus satu kali lagi:

```bash
npm run test:render-stability
```

Jika percobaan kedua lulus, simpan output dan periksa apakah kegagalan pertama berasal dari timing atau resource sistem. Jika tetap gagal, anggap sebagai regresi nyata dan periksa metrik yang disebutkan pada pesan assertion.

## Playwright memperingatkan OS tidak didukung

Linux Mint dapat memakai fallback build Ubuntu. Peringatan bukan kegagalan jika browser berhasil dipasang dan test lulus.

```bash
npx playwright install chromium
npm run test:render-stability
```

## `npm audit` menemukan kerentanan

Jangan langsung menjalankan perbaikan otomatis. Periksa dependency tree:

```bash
npm audit
npm audit --omit=dev
npm ls nama-paket
```

Gunakan [panduan pembaruan teknologi](MEMPERBARUI-TEKNOLOGI.md) untuk menilai risiko dan ruang lingkup perbaikan.

## Git menolak penghapusan branch

Gunakan penghapusan aman:

```bash
git branch -d nama-branch
```

Jika ditolak, branch mungkin belum tergabung. Periksa Pull Request dan commit sebelum mempertimbangkan penghapusan paksa.

## Deployment tidak menampilkan perubahan

Periksa urutan berikut:

1. commit sudah berada pada `main`;
2. CI `main` berhasil;
3. workflow Pages berhasil;
4. URL yang dibuka benar;
5. hard refresh atau incognito sudah dicoba;
6. aset tidak gagal karena perbedaan huruf besar/kecil.

Jika CI atau Pages gagal, periksa log run pertama yang gagal. Jangan menjalankan ulang berkali-kali tanpa memahami error awal.
