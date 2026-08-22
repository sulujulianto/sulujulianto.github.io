# Mengubah Tampilan dan Kode Portfolio

Panduan ini digunakan saat mengubah HTML, CSS, TypeScript, JavaScript, atau perilaku antarmuka portfolio.

## 1. Mulai dari `main` terbaru

```bash
git switch main
git pull --ff-only origin main
git status --short --branch
git switch -c jenis/ringkasan-pekerjaan
```

Jangan memulai perubahan langsung pada `main`. Jika working tree tidak bersih, periksa perubahan tersebut sebelum berpindah branch.

## 2. Aktifkan toolchain

```bash
nvm use
npm ci
```

`nvm use` membaca `.nvmrc`. `npm ci` memasang versi yang terkunci dalam `package-lock.json`.

## 3. Jalankan server lokal

```bash
python3 -m http.server 8080
```

Buka <http://localhost:8080/>. Gunakan terminal lain untuk proses build atau test.

## Mengubah CSS

Source utama:

```text
assets/css/main.css
```

Hasil build:

```text
assets/css/output.css
```

Selama mengedit:

```bash
npm run tailwind:watch
```

Untuk build satu kali:

```bash
npm run tailwind:build
```

Jangan mengedit `output.css` secara manual. Jika class Tailwind ditambahkan pada HTML atau TSX, build CSS tetap harus dijalankan.

## Mengubah HTML

Halaman aktif:

- `index.html`;
- `projects.html`;
- `certificates.html`;
- `404.html`;
- `projects/<slug>/index.html`.

Folder `id/`, `en/`, `jp/`, dan `cn/` hanya redirect. Jangan menyalin halaman utama ke folder tersebut.

Saat mengubah struktur HTML, periksa:

- ID elemen tidak duplikat;
- heading tetap berurutan;
- kontrol dapat digunakan dengan keyboard;
- teks fallback tetap tersedia;
- canonical, hreflang, dan metadata tidak hilang;
- class baru terdeteksi oleh Tailwind.

## Mengubah TypeScript

Source runtime:

- `assets/js/app.tsx`: kartu, galeri, riwayat, sertifikat, dan keahlian;
- `assets/js/project-detail.tsx`: renderer studi kasus;
- `assets/js/language-resolver.ts`: pemilihan bahasa;
- `assets/js/locale-manager.ts`: penerapan katalog, URL, metadata, CV, dan pemilih bahasa.

Hasil kompilasi berada di `assets/js/dist/`. Jangan mengedit file tersebut secara manual.

Setelah mengubah source:

```bash
npm run ts:build
git diff -- assets/js assets/js/dist
```

Pastikan output hanya berubah sesuai source yang diedit.

## Mengubah JavaScript biasa

`assets/js/theme.js` mengatur tema, menu mobile, smooth scrolling, dan tombol kembali ke atas. File ini tidak melalui TypeScript, tetapi tetap harus melewati seluruh pengujian.

Hindari menambahkan logika halaman baru ke `theme.js` jika tanggung jawabnya lebih tepat berada pada runtime TypeScript.

## Mengubah JSON

JSON tidak memerlukan build tersendiri. Pastikan:

- menggunakan tanda kutip ganda;
- tidak memiliki koma setelah item terakhir;
- tipe setiap field tidak berubah tanpa migrasi;
- tanggal mengikuti format yang didokumentasikan;
- path aset benar dan case-sensitive.

Gunakan panduan khusus untuk [proyek](MENULIS-PROYEK.md), [sertifikat](MENGELOLA-SERTIFIKAT.md), [riwayat dan keahlian](MENGELOLA-RIWAYAT-DAN-KEAHLIAN.md), atau [bahasa dan metadata](MENGELOLA-BAHASA-DAN-METADATA.md).

## Pemeriksaan selama bekerja

Jalankan test terfokus terlebih dahulu agar feedback lebih cepat:

```bash
npm run test:ui-locale
npm run test:projects
npm run test:skills
npm run test:content
```

Pilih hanya test yang berkaitan. Sebelum commit, `npm run verify` tetap wajib.

## Pemeriksaan sebelum commit

```bash
npm run verify
git diff --check
git status --short --branch
git diff --name-status
git diff
```

Tiga warning gambar proyek yang sudah dikenal boleh muncul. Kegagalan atau warning baru harus dijelaskan sebelum perubahan diteruskan.

## Stage dan commit

Stage hanya file yang menjadi bagian pekerjaan:

```bash
git add -- path/file-pertama path/file-kedua
git diff --cached --check
git diff --cached --stat
git diff --cached
git commit -m "jenis: ringkasan perubahan"
```

Jangan menggunakan staging seluruh repository sebelum memeriksa setiap file.

Lanjutkan dengan [checklist publikasi](CHECKLIST-PUBLIKASI.md) untuk push, Pull Request, CI, dan pemeriksaan deployment.
