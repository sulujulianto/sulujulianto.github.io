# Pemeriksaan Rutin Bulanan Portfolio

Lakukan pemeriksaan pada minggu pertama setiap bulan atau sebelum mengirim portfolio untuk lamaran penting. Pemeriksaan tidak harus menghasilkan commit; tujuannya mengetahui kondisi dan menangani risiko yang nyata.

## Jadwal

| Waktu | Pemeriksaan |
| --- | --- |
| Setiap bulan | Dependency, build, test, tautan, aset, masa berlaku sertifikat, dan situs publik. |
| Saat ada proyek atau sertifikat baru | Perbarui konten tanpa menunggu jadwal bulanan. |
| Setiap tiga bulan | CV, profil, riwayat, keahlian, SEO, dan social preview. |
| Setelah perubahan besar | Verifikasi lengkap, browser manual, CI, dan deployment. |

## 1. Buat branch pemeliharaan

```bash
git switch main
git pull --ff-only origin main
git switch -c chore/maintenance-YYYY-MM
nvm install 24
nvm use
npm ci
```

Gunakan tahun dan bulan saat pemeriksaan, misalnya `chore/maintenance-2026-09`.

## 2. Periksa toolchain dan dependency

```bash
node --version
npm --version
npm audit
npm outdated
npm run verify
```

Cara membaca hasil:

- `npm audit` menunjukkan advisory pada dependency yang terpasang, bukan jaminan bahwa semua risiko sudah hilang;
- `npm outdated` adalah daftar informasi, bukan perintah untuk memperbarui semuanya;
- pembaruan major harus dikerjakan pada branch khusus;
- `npm run verify` harus lulus.

Gunakan [MEMPERBARUI-TEKNOLOGI.md](MEMPERBARUI-TEKNOLOGI.md) sebelum mengubah dependency.

## 3. Periksa proyek

- Pastikan status `published` dan `in-development` masih benar.
- Buka repository dan Live Demo setiap proyek.
- Pastikan tech stack sesuai kode terbaru.
- Cari deskripsi yang berlebihan atau tidak lagi akurat.
- Pastikan tiga proyek unggulan masih mewakili kemampuan terbaik.
- Periksa detail proyek, gambar, keterbatasan, dan sitemap.

Baca [MENULIS-PROYEK.md](MENULIS-PROYEK.md) jika perlu memperbarui isinya.

## 4. Periksa sertifikat

- Cari credential yang kedaluwarsa atau akan kedaluwarsa dalam 60 hari.
- Buka link verifikasi dalam mode incognito.
- Pastikan tiga sertifikat unggulan masih relevan.
- Periksa apakah deskripsi tetap sesuai silabus atau credential.
- Pastikan gambar penuh dapat dibaca dan tidak membocorkan data pribadi.

Baca [MENGELOLA-SERTIFIKAT.md](MENGELOLA-SERTIFIKAT.md) sebelum mengubah data.

## 5. Periksa riwayat, keahlian, dan CV

- Tambahkan perubahan pengalaman, pendidikan, atau pelatihan yang benar-benar terjadi.
- Periksa tanggal dan status kegiatan yang masih berlangsung.
- Hapus atau turunkan status klaim teknologi yang tidak lagi dapat dibuktikan.
- Naikkan status teknologi belajar hanya jika bukti telah berubah.
- Pastikan CV Indonesia dan English masih sesuai portfolio.
- Periksa tombol unduh CV pada empat bahasa.

## 6. Periksa bahasa dan metadata

- Uji `?lang=id`, `?lang=en`, `?lang=ja`, dan `?lang=zh`.
- Pastikan navigasi mempertahankan bahasa aktif.
- Periksa judul halaman, meta description, canonical, dan hreflang.
- Pastikan gambar social preview tetap 1200 × 630.
- Validasi `sitemap.xml` jika proyek baru ditambahkan.
- Pastikan URL redirect lama tetap bekerja.

## 7. Periksa browser

Minimal buka:

- `/`;
- `/projects.html`;
- `/certificates.html`;
- satu detail proyek;
- satu URL yang tidak tersedia.

Uji:

- desktop dan mobile;
- mode terang dan gelap;
- menu dan dropdown bahasa;
- navigasi keyboard;
- filter proyek dan sertifikat;
- gambar, tombol, link, CV, dan form kontak;
- Console serta Network browser.

## 8. Periksa situs publik

Setelah merge dan deployment:

- buka situs dalam incognito;
- lakukan hard refresh;
- periksa GitHub Actions;
- periksa deployment GitHub Pages;
- pastikan `main` lokal sinkron dengan `origin/main`.

## Template catatan bulanan

```md
## Pemeriksaan YYYY-MM

- [ ] Node dan npm diperiksa
- [ ] `npm audit` diperiksa
- [ ] dependency outdated dinilai
- [ ] `npm run verify` lulus
- [ ] proyek dan link diperiksa
- [ ] masa berlaku sertifikat diperiksa
- [ ] riwayat, keahlian, dan CV ditinjau
- [ ] empat bahasa dan metadata ditinjau
- [ ] desktop/mobile serta terang/gelap diperiksa
- [ ] CI dan situs publik diperiksa

Catatan:
- ...
```

Jika tidak ada perubahan, jangan membuat commit kosong. Simpan hasil sebagai issue, catatan pribadi, atau checklist pada jadwal pemeliharaan berikutnya.
