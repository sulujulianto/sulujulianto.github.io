# Pemeriksaan Rutin Bulanan

Lakukan pemeriksaan ini satu kali pada minggu pertama setiap bulan. Tidak perlu memperbarui semua dependency hanya karena versi baru tersedia; tujuan pemeriksaan adalah mengetahui kondisi, menilai risiko, lalu mengubahnya dalam branch terpisah.

## Ringkasan jadwal

| Waktu | Yang diperiksa |
| --- | --- |
| Setiap bulan | Link, data, sertifikat kedaluwarsa, dependency, build, tes, tampilan, dan GitHub Pages |
| Saat ada proyek/sertifikat baru | Perbarui konten segera; tidak perlu menunggu jadwal bulanan |
| Setiap 3 bulan | Tinjau CV, deskripsi profil, social preview, SEO, dan template Fuwari |
| Setelah perubahan besar | Jalankan verifikasi penuh dan cek situs publik |

## 1. Siapkan branch pemeliharaan

```bash
git switch main
git pull --ff-only origin main
git switch -c chore/maintenance-YYYY-MM
npm ci
```

Ganti `YYYY-MM`, misalnya `chore/maintenance-2026-08`.

## 2. Periksa kondisi dasar

```bash
npm run verify
npm audit
npm outdated
```

Cara membaca hasil:

- `npm run verify` harus lulus.
- `npm audit` digunakan untuk kerentanan dependency root.
- `npm outdated` hanya memberi daftar versi; jangan langsung memperbarui semuanya sekaligus.

Untuk blog:

```bash
cd blog-fuwari
pnpm install --frozen-lockfile
pnpm doctor
pnpm outdated
pnpm audit
cd ..
```

## 3. Kapan dependency perlu diperbarui?

Prioritas pembaruan:

1. Perbaikan keamanan yang relevan.
2. Bug yang benar-benar memengaruhi situs.
3. Versi patch dan minor yang kompatibel.
4. Versi major hanya setelah membaca migration guide dan menguji branch khusus.

Tailwind root dikunci pada `3.4.19` karena build dan tes portfolio bergantung pada toolchain v3. Jangan memindahkan root portfolio ke Tailwind v4 hanya karena tersedia versi lebih baru.

Jangan memperbarui Astro/Fuwari bersamaan dengan banyak perubahan portfolio. Gunakan panduan [UPDATE-FUWARI.md](UPDATE-FUWARI.md) dan branch tersendiri.

## 4. Periksa konten

- Pastikan proyek yang selesai tidak masih berstatus `in-development`.
- Pastikan tombol GitHub dan Live Demo menuju halaman yang benar.
- Cari sertifikat yang akan kedaluwarsa dalam 60 hari.
- Perbarui CV jika ada pengalaman, proyek utama, atau sertifikasi penting baru.
- Tinjau bagian Riwayat jika ada perubahan status pekerjaan/pelatihan.
- Periksa daftar Keahlian; hapus klaim yang tidak lagi dapat dibuktikan.
- Jangan menaikkan teknologi dari `planned` atau `activeDevelopment` menjadi klaim biasa hanya karena pernah mencoba sebentar.

## 5. Periksa tampilan secara manual

Minimal buka:

- `/`
- `/projects.html`
- `/certificates.html`
- satu detail proyek Indonesia;
- detail Atlas Country API berbahasa Inggris;
- `/blog/`;
- satu URL yang tidak ada untuk memeriksa `404.html`.

Uji:

- desktop dan mobile;
- mode terang dan gelap;
- `?lang=id`, `?lang=en`, `?lang=ja`, dan `?lang=zh`;
- dropdown bahasa dan menu mobile;
- gambar, tautan, filter, tombol unduh CV, dan form kontak;
- judul Keahlian tetap terlihat pada empat bahasa.

## 6. Periksa situs publik

Setelah merge dan deployment:

- buka situs dalam incognito;
- lakukan hard refresh;
- cek halaman utama, proyek, sertifikat, detail proyek, blog, sitemap, dan social preview;
- pastikan GitHub Actions lulus;
- pastikan `main` lokal kembali sinkron dengan `origin/main`.

## 7. Catatan pemeriksaan

Salin template berikut ke deskripsi Pull Request atau issue pemeliharaan:

```md
## Pemeriksaan YYYY-MM

- [ ] `npm run verify` lulus
- [ ] `npm audit` diperiksa
- [ ] dependency outdated ditinjau
- [ ] blog doctor/audit diperiksa
- [ ] link dan aset diperiksa
- [ ] sertifikat kedaluwarsa ditinjau
- [ ] CV dan Riwayat ditinjau
- [ ] Keahlian ditinjau berdasarkan bukti
- [ ] empat bahasa diperiksa
- [ ] desktop/mobile dan terang/gelap diperiksa
- [ ] situs publik diperiksa setelah deployment

Catatan:
- ...
```

Jika tidak ada perubahan yang diperlukan, tidak perlu membuat commit kosong. Simpan hasil pemeriksaan sebagai issue atau catatan pribadi.
