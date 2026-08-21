# Portfolio Sulu Edward Julianto

Repository ini berisi portfolio multibahasa dan blog pribadi Sulu Edward Julianto yang ditayangkan melalui GitHub Pages.

- Portfolio: <https://sulujulianto.github.io/>
- Proyek: <https://sulujulianto.github.io/projects.html>
- Sertifikat: <https://sulujulianto.github.io/certificates.html>
- Blog: <https://sulujulianto.github.io/blog/>

## Gambaran saat ini

Portfolio bukan lagi empat situs terpisah. Sekarang hanya ada tiga halaman utama yang dipakai bersama oleh semua bahasa:

- `index.html` untuk beranda.
- `projects.html` untuk seluruh proyek.
- `certificates.html` untuk seluruh sertifikat.

Bahasa dipilih dengan parameter `?lang=id|en|ja|zh`. Pilihan disimpan di browser. Jika belum ada pilihan, situs membaca bahasa browser dan memakai Bahasa Indonesia sebagai fallback.

Folder `id/`, `en/`, `jp/`, dan `cn/` hanya berisi redirect untuk menjaga tautan lama tetap bekerja. Jangan menambahkan konten baru ke folder tersebut.

## Teknologi

- HTML statis untuk struktur halaman.
- React 18 via CDN untuk kartu proyek, sertifikat, riwayat, galeri, dan keahlian.
- TypeScript sebagai source runtime portfolio.
- Tailwind CSS 3.4.19 dan CSS khusus di `assets/css/main.css`.
- JSON terpisah per bahasa untuk isi portfolio.
- Astro/Fuwari untuk source blog di `blog-fuwari/`.
- Node.js 24 LTS untuk build dan verifikasi portfolio.
- GitHub Pages untuk hosting dan GitHub Actions untuk verifikasi.

## Mulai dari dokumentasi

Buka [`docs/README.md`](docs/README.md). Halaman tersebut menunjukkan panduan yang harus dibaca untuk setiap jenis perubahan.

Panduan utama:

- [`docs/SETUP-BARU.md`](docs/SETUP-BARU.md): menyiapkan komputer baru.
- [`docs/ALUR-PENGEMBANGAN.md`](docs/ALUR-PENGEMBANGAN.md): mengedit CSS, HTML, TypeScript, menjalankan build, dan membuat branch.
- [`docs/UPDATE-KONTEN-PORTFOLIO.md`](docs/UPDATE-KONTEN-PORTFOLIO.md): memperbarui proyek, detail proyek, sertifikat, riwayat, teknologi, CV, dan bahasa.
- [`docs/PEMERIKSAAN-BULANAN.md`](docs/PEMERIKSAAN-BULANAN.md): pemeriksaan rutin sebulan sekali.
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md): solusi masalah umum.

## Menjalankan portfolio

Gunakan Node.js 24 LTS, lalu:

```bash
npm ci
npm run verify
python3 -m http.server 8080
```

Buka <http://localhost:8080/>. Jangan membuka `index.html` langsung melalui `file://` karena browser dapat memblokir pembacaan JSON.

## Perintah penting

| Perintah | Kegunaan |
| --- | --- |
| `npm run tailwind:watch` | Membangun CSS otomatis selama mengedit tampilan. |
| `npm run tailwind:build` | Membangun `assets/css/output.css` satu kali. |
| `npm run ts:build` | Membangun TypeScript ke `assets/js/dist/`. |
| `npm run audit:portfolio` | Memeriksa data dan aset portfolio. |
| `npm run audit:baseline:update` | Menerima perubahan data proyek, sertifikat, atau kategori yang sudah ditinjau. |
| `npm test` | Menjalankan seluruh tes portfolio. |
| `npm run verify` | Build CSS, audit data, build TypeScript, dan menjalankan seluruh tes. |
| `npm run blog:dev` | Menjalankan blog dalam mode pengembangan. |
| `npm run blog:build` | Membangun source blog ke folder `blog/`. |
| `npm run blog:doctor` | Memeriksa konfigurasi dan hasil build blog. |

## Struktur repository

```text
.
├── index.html, projects.html, certificates.html
├── projects/<slug>/           halaman detail proyek yang sudah dipublikasikan
├── assets/
│   ├── css/                   source CSS dan hasil build Tailwind
│   ├── data/                  data JSON, CV, dan katalog bahasa
│   ├── icons/                 sprite ikon lokal
│   ├── img/                   gambar portfolio
│   └── js/                    source TypeScript/JavaScript dan hasil build
├── id/, en/, jp/, cn/         redirect URL lama
├── blog-fuwari/               source blog; edit di sini
├── blog/                      hasil build blog; jangan edit manual
├── docs/                      panduan pemeliharaan
├── scripts/                   audit data portfolio
├── tests/                     tes otomatis
└── .github/workflows/         pemeriksaan Pull Request
```

## Aturan yang tidak boleh dilupakan

1. Edit `assets/css/main.css`, bukan `assets/css/output.css` secara manual.
2. Edit file `.ts` atau `.tsx`, bukan file di `assets/js/dist/` secara manual.
3. Edit blog di `blog-fuwari/`, bukan di `blog/`.
4. Isi tiap bahasa boleh berbeda. Jangan memaksa proyek dan sertifikat menjadi terjemahan satu sama lain.
5. Proyek berstatus `published` memerlukan kartu, artikel JSON, shell HTML, gambar, dan entri sitemap yang cocok.
6. Setelah perubahan data proyek, sertifikat, atau kategori disengaja, tinjau diff lalu jalankan `npm run audit:baseline:update`.
7. Sebelum commit atau Pull Request, selalu jalankan `npm run verify` dan `git diff --check`.
8. Gunakan branch baru; jangan mengerjakan perubahan langsung di `main`.

## Catatan aset yang belum tersedia

Audit saat ini memperbolehkan tiga gambar proyek yang memang belum tersedia:

- `assets/img/projects/id/antriankku.webp`
- `assets/img/projects/id/kospintar.webp`
- `assets/img/projects/id/lokerkita.webp`

Ketiganya masih berupa proyek dalam pengembangan. Jika gambarnya sudah ditambahkan, hapus path terkait dari daftar `EXPECTED_KNOWN_MISSING_ASSETS` di `scripts/audit-portfolio-data.mjs`, perbarui baseline audit, lalu jalankan verifikasi.

## Lisensi

Kode repository menggunakan lisensi ISC sebagaimana tercantum di `package.json`. Konten pribadi, CV, foto, dan sertifikat tetap merupakan materi milik Sulu Edward Julianto.
