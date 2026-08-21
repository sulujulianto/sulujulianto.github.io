# Menulis dan Menerbitkan Postingan Blog

Gunakan panduan ini untuk membuat artikel yang mudah dibaca, dapat diperiksa, dan aman dibangun oleh Astro.

## Membuat post baru

Dari `blog-fuwari/`, jalankan:

```bash
pnpm new-post catatan-belajar-astro
```

Slug hanya boleh memakai huruf kecil, angka, dan tanda minus. Script menolak path, ekstensi, spasi, dan pola seperti `../`.

Perintah tersebut membuat:

```text
src/content/posts/catatan-belajar-astro/
└── index.md
```

Post baru selalu memakai `draft: true` agar tidak terbit sebelum selesai ditinjau.

## Struktur yang disarankan

```text
src/content/posts/catatan-belajar-astro/
├── index.md
├── cover.webp
└── images/
    ├── diagram.webp
    └── hasil.webp
```

Nama file menggunakan huruf kecil dan tanda minus. Simpan gambar milik artikel di folder artikel, bukan di `blog/`.

## Frontmatter

```yaml
---
title: "Catatan Belajar Astro"
published: 2026-08-21
updated: 2026-08-22
description: "Ringkasan spesifik mengenai masalah, pendekatan, dan hasil yang dibahas."
image: "./cover.webp"
tags: ["Astro", "Web Development", "lang:id"]
category: "Engineering"
draft: true
lang: "id"
---
```

Aturannya:

- `title` jelas dan sesuai isi;
- `published` adalah tanggal publikasi pertama;
- `updated` hanya ditambahkan ketika isi mengalami perubahan bermakna;
- `description` menjelaskan isi, bukan slogan promosi;
- `image` menggunakan path relatif menuju cover;
- `tags` spesifik dan tidak berlebihan;
- `category` menggunakan kelompok yang konsisten;
- `draft` tetap `true` selama penulisan;
- `lang` menggunakan `id`, `en`, `ja`, atau `zh` sesuai bahasa artikel.

## Struktur tulisan

Struktur tidak harus seragam untuk semua artikel, tetapi pembaca sebaiknya menemukan:

1. konteks atau masalah;
2. tujuan tulisan;
3. pendekatan atau proses;
4. hasil dan bukti;
5. keterbatasan atau hal yang belum selesai;
6. pelajaran dan langkah berikutnya.

Gunakan judul bagian yang menjelaskan isi. Hindari klaim seperti “sempurna”, “enterprise-grade”, atau “scalable” jika tidak ada bukti pengujian maupun penggunaan nyata.

## Gambar dan tautan

Gunakan teks alternatif yang menjelaskan isi gambar:

```md
![Hasil audit aksesibilitas halaman artikel](./images/hasil-audit.webp)
```

Hindari teks seperti `gambar`, `screenshot`, atau alt kosong. Kompres gambar sebelum dimasukkan dan pilih WebP untuk foto atau tangkapan layar apabila hasilnya tetap terbaca.

Periksa setiap tautan eksternal dan gunakan sumber primer jika menyatakan fakta teknis, jadwal, hasil kompetisi, atau informasi organisasi.

## Code fence

Setiap pembuka code fence wajib mempunyai penutup:

````md
```ts
const status = "siap ditinjau";
```
````

Pengujian source akan gagal apabila jumlah code fence tidak berpasangan.

## Menerbitkan

1. Baca artikel sebagai pembaca yang tidak mengetahui konteksnya.
2. Periksa fakta, ejaan, gambar, dan tautan.
3. Ubah `draft: true` menjadi `draft: false`.
4. Jalankan:

   ```bash
   pnpm format:check
   pnpm lint
   pnpm verify
   pnpm audit --prod
   ```

5. Tinjau source dan perubahan hasil build dalam `../blog/`.
6. Jalankan server dari root repository untuk pemeriksaan browser:

   ```bash
   cd ..
   python3 -m http.server 8080
   ```

7. Buka `http://localhost:8080/blog/`, halaman artikel, arsip, RSS, dan sitemap.

Jangan mengedit HTML dalam `blog/` untuk memperbaiki artikel. Perbaiki source lalu bangun ulang.
