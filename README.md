# Portfolio Sulu Edward Julianto

[![Portfolio CI](https://github.com/sulujulianto/sulujulianto.github.io/actions/workflows/portfolio-ci.yml/badge.svg)](https://github.com/sulujulianto/sulujulianto.github.io/actions/workflows/portfolio-ci.yml)

Repository ini memuat portfolio multibahasa Sulu Edward Julianto yang dipublikasikan melalui GitHub Pages. Konten utama mencakup profil, riwayat, keahlian, proyek, studi kasus, dan sertifikat. Blog berada dalam repository yang sama, tetapi mempunyai source dan alur pemeliharaan tersendiri.

- Portfolio: <https://sulujulianto.github.io/>
- Daftar proyek: <https://sulujulianto.github.io/projects.html>
- Daftar sertifikat: <https://sulujulianto.github.io/certificates.html>
- Blog: <https://sulujulianto.github.io/blog/>

## Arsitektur singkat

Portfolio menggunakan tiga halaman utama untuk semua bahasa:

- `index.html` untuk beranda;
- `projects.html` untuk daftar proyek;
- `certificates.html` untuk daftar sertifikat.

Bahasa dipilih melalui parameter `?lang=id|en|ja|zh` dan disimpan di browser. Folder `id/`, `en/`, `jp/`, dan `cn/` hanya berisi redirect agar URL lama tetap berfungsi. Konten baru tidak boleh ditambahkan ke folder redirect tersebut.

Data proyek dan sertifikat disimpan terpisah untuk setiap bahasa. Setiap karya atau credential hanya ditempatkan pada satu katalog dan tidak boleh diduplikasi sebagai terjemahan pada katalog bahasa lain. Katalog Jepang dan Mandarin boleh tetap berisi placeholder sampai tersedia konten khusus untuk bahasa tersebut.

## Teknologi portfolio

| Teknologi | Versi/peran |
| --- | --- |
| HTML | Struktur halaman statis dan metadata awal. |
| React | Versi 18.3.1 melalui CDN untuk komponen dinamis. |
| TypeScript | Versi 5.9.3 untuk source runtime portfolio. |
| Tailwind CSS | Versi 3.4.19 untuk utility CSS dan build stylesheet. |
| PostCSS dan Autoprefixer | Pemrosesan CSS pada tahap build. |
| Node.js | Major 24 LTS untuk instalasi, build, audit, dan pengujian. |
| Playwright | Pengujian kestabilan layout dan tampilan responsif. |
| GitHub Actions | Verifikasi otomatis pada Pull Request dan branch `main`. |
| GitHub Pages | Hosting situs statis. |

React 19, Tailwind CSS 4, dan TypeScript 7 belum digunakan karena masing-masing memerlukan migrasi mayor. Alasan dan cara menilai pembaruannya dijelaskan dalam [panduan pembaruan teknologi](docs/MEMPERBARUI-TEKNOLOGI.md).

## Menjalankan secara lokal

Prasyarat: Git, Node.js melalui NVM, dan Python 3 untuk server lokal.

```bash
nvm use
npm ci
npm run verify
python3 -m http.server 8080
```

Buka <http://localhost:8080/>. Jangan membuka `index.html` melalui `file://` karena browser dapat memblokir pembacaan data JSON.

## Perintah utama

| Perintah | Kegunaan |
| --- | --- |
| `npm run tailwind:watch` | Membangun CSS otomatis selama mengubah tampilan. |
| `npm run tailwind:build` | Membangun `assets/css/output.css` satu kali. |
| `npm run ts:build` | Mengompilasi TypeScript ke `assets/js/dist/`. |
| `npm run audit:portfolio` | Memeriksa struktur data, baseline, dan aset portfolio. |
| `npm run audit:baseline:update` | Memperbarui baseline setelah perubahan data yang sudah ditinjau. |
| `npm test` | Menjalankan seluruh pengujian portfolio. |
| `npm run verify` | Menjalankan build, audit data, dan seluruh pengujian. |

Perintah blog tetap tersedia, tetapi penggunaannya dijelaskan terpisah dalam [panduan menulis postingan](docs/WRITE-POSTS.md) dan [panduan memperbarui Fuwari](docs/UPDATE-FUWARI.md).

## Struktur repository

```text
.
├── index.html
├── projects.html
├── certificates.html
├── 404.html
├── projects/<slug>/              halaman detail proyek yang dipublikasikan
├── assets/
│   ├── css/                      source dan hasil build CSS
│   ├── data/                     data portfolio per bahasa dan CV
│   ├── icons/                    sprite ikon lokal
│   ├── img/                      gambar portfolio dan social preview
│   └── js/                       source TypeScript/JavaScript dan hasil build
├── id/, en/, jp/, cn/            redirect URL lama
├── docs/                         panduan pemeliharaan
├── scripts/                      audit data portfolio
├── tests/                        pengujian otomatis
├── blog-fuwari/                  source blog
├── blog/                         hasil build blog
└── .github/workflows/            konfigurasi CI
```

## Dokumentasi pemeliharaan

Mulai dari [pusat dokumentasi](docs/README.md). Panduan utama dipisahkan berdasarkan pekerjaan:

- [Menyiapkan repository di komputer baru](docs/SETUP-BARU.md)
- [Mengubah tampilan dan kode](docs/ALUR-PENGEMBANGAN.md)
- [Menulis dan menerbitkan proyek](docs/MENULIS-PROYEK.md)
- [Menambah dan merawat sertifikat](docs/MENGELOLA-SERTIFIKAT.md)
- [Mengelola riwayat dan keahlian](docs/MENGELOLA-RIWAYAT-DAN-KEAHLIAN.md)
- [Mengelola bahasa, CV, gambar, dan metadata](docs/MENGELOLA-BAHASA-DAN-METADATA.md)
- [Memeriksa dan memperbarui teknologi](docs/MEMPERBARUI-TEKNOLOGI.md)
- [Melakukan pemeriksaan rutin bulanan](docs/PEMERIKSAAN-BULANAN.md)
- [Menjalankan checklist sebelum publikasi](docs/CHECKLIST-PUBLIKASI.md)
- [Mengatasi masalah umum](docs/TROUBLESHOOTING.md)

## Aturan kerja

1. Mulai setiap pekerjaan dari `main` terbaru dan gunakan branch baru.
2. Edit source, bukan file hasil build.
3. Stage hanya file yang memang menjadi bagian perubahan.
4. Jangan menerima baseline audit sebelum diff data ditinjau.
5. Jangan menulis klaim proyek, keahlian, atau sertifikat yang tidak dapat dibuktikan.
6. Jalankan `npm run verify` dan `git diff --check` sebelum commit.
7. Tunggu CI lulus dan periksa deployment sebelum menganggap pekerjaan selesai.

## File hasil build

- Edit `assets/css/main.css`; hasilnya berada di `assets/css/output.css`.
- Edit file `.ts` atau `.tsx` dalam `assets/js/`; hasilnya berada di `assets/js/dist/`.
- Edit blog dalam `blog-fuwari/`; folder `blog/` adalah hasil build.

Jangan mengedit file hasil build secara manual karena perubahan akan hilang saat build berikutnya.

## Warning aset yang diketahui

Audit masih memperbolehkan tiga gambar proyek lama yang belum tersedia:

- `assets/img/projects/id/antriankku.webp`
- `assets/img/projects/id/kospintar.webp`
- `assets/img/projects/id/lokerkita.webp`

Warning tersebut bukan kegagalan, tetapi warning baru tetap harus diperiksa.

## Lisensi

Kode repository menggunakan lisensi ISC sebagaimana tercantum dalam `package.json`. Konten pribadi, foto, CV, dan gambar sertifikat tetap merupakan materi milik Sulu Edward Julianto.
