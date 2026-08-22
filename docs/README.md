# Pusat Dokumentasi Repository

Repository ini berisi dua situs yang dipublikasikan bersama, tetapi mempunyai source, dependency, build, dan pemeriksaan yang berbeda.

| Bagian | Source | Output publik | Dokumentasi |
| --- | --- | --- | --- |
| Portfolio | root repository, `assets/`, dan data portfolio | root GitHub Pages | [docs/portfolio/](portfolio/README.md) |
| Blog | `blog-fuwari/` | `blog/` | [docs/blog/](blog/README.md) |

Jangan menjalankan panduan salah satu bagian seolah-olah berlaku otomatis untuk bagian lainnya.

## Jika menggunakan komputer baru

Satu kali clone sudah memuat portfolio dan blog. Ikuti dua panduan ini secara berurutan:

1. [Siapkan portfolio dan dependency root](portfolio/SETUP-BARU.md).
2. [Siapkan dependency dan build blog](blog/SETUP-BARU.md).

## Memilih panduan

### Portfolio

Gunakan [Pusat Dokumentasi Portfolio](portfolio/README.md) untuk:

- mengubah tampilan atau logika;
- menambah proyek dan sertifikat;
- mengelola bahasa, CV, riwayat, dan metadata;
- memeriksa dependency;
- menjalankan pemeriksaan rutin;
- mengatasi masalah portfolio.

### Blog

Gunakan [Pusat Dokumentasi Blog](blog/README.md) untuk:

- menyiapkan blog pada laptop baru;
- menulis dan menerbitkan postingan;
- memperbarui core Fuwari;
- memeriksa hasil build;
- mengatasi masalah blog.

## Aturan umum

1. Mulai dari `main` terbaru dan working tree bersih.
2. Gunakan branch berbeda untuk pekerjaan portfolio dan blog.
3. Edit source; jangan mengedit hasil build secara manual.
4. Tinjau diff sebelum staging.
5. Stage hanya file yang sudah diperiksa.
6. Jalankan pemeriksaan otomatis dan pemeriksaan visual yang sesuai.
7. Tunggu CI dan periksa deployment sebelum menutup pekerjaan.

Baca [README utama](../README.md) untuk gambaran arsitektur repository.
