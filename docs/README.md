# Pusat Dokumentasi Portfolio

Halaman ini adalah daftar isi pemeliharaan portfolio. Pilih panduan berdasarkan pekerjaan yang akan dilakukan; Anda tidak perlu mengingat seluruh struktur repository.

## Mulai di sini

| Kebutuhan | Panduan |
| --- | --- |
| Menyiapkan repository pada komputer baru | [SETUP-BARU.md](SETUP-BARU.md) |
| Mengubah HTML, CSS, TypeScript, atau perilaku halaman | [ALUR-PENGEMBANGAN.md](ALUR-PENGEMBANGAN.md) |
| Menambah kartu proyek atau menulis studi kasus | [MENULIS-PROYEK.md](MENULIS-PROYEK.md) |
| Menambah sertifikat atau memperbaiki deskripsinya | [MENGELOLA-SERTIFIKAT.md](MENGELOLA-SERTIFIKAT.md) |
| Mengubah pengalaman, pendidikan, pelatihan, atau keahlian | [MENGELOLA-RIWAYAT-DAN-KEAHLIAN.md](MENGELOLA-RIWAYAT-DAN-KEAHLIAN.md) |
| Mengubah bahasa, CV, foto, social preview, atau metadata | [MENGELOLA-BAHASA-DAN-METADATA.md](MENGELOLA-BAHASA-DAN-METADATA.md) |
| Memeriksa dependency atau merencanakan upgrade mayor | [MEMPERBARUI-TEKNOLOGI.md](MEMPERBARUI-TEKNOLOGI.md) |
| Melakukan pemeriksaan rutin | [PEMERIKSAAN-BULANAN.md](PEMERIKSAAN-BULANAN.md) |
| Memastikan perubahan siap di-commit dan dipublikasikan | [CHECKLIST-PUBLIKASI.md](CHECKLIST-PUBLIKASI.md) |
| Menangani build, data, gambar, bahasa, atau deployment yang bermasalah | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

## Urutan umum setiap perubahan

1. Sinkronkan `main` dan buat branch baru.
2. Baca panduan yang sesuai dengan jenis perubahan.
3. Ubah hanya source dan data yang diperlukan.
4. Tinjau diff sebelum memperbarui baseline atau hasil build.
5. Jalankan pemeriksaan otomatis dan pemeriksaan browser.
6. Stage hanya file yang berkaitan.
7. Buat Pull Request, tunggu CI lulus, lalu periksa deployment.

Gunakan [CHECKLIST-PUBLIKASI.md](CHECKLIST-PUBLIKASI.md) sebagai daftar pemeriksaan terakhir.

## Source dan hasil build

| Yang diubah | Source yang diedit | Hasil build yang ikut di-commit |
| --- | --- | --- |
| Tampilan portfolio | `assets/css/main.css` dan class pada HTML/TSX | `assets/css/output.css` |
| Logika portfolio | `assets/js/*.ts` dan `assets/js/*.tsx` | `assets/js/dist/*.js` |
| Data portfolio | `assets/data/**/*.json` | Tidak ada; baseline audit mungkin berubah |
| Blog | `blog-fuwari/` | `blog/` |

Jangan memperbaiki source dengan mengedit file hasil build secara langsung.

## Empat prinsip penulisan

1. Tulis fakta yang dapat diperiksa dari repository, sertifikat, atau pengalaman nyata.
2. Jelaskan fungsi dan keputusan teknis sebelum memakai kata sifat promosi.
3. Sebutkan keterbatasan jika fitur, deployment, pengujian, atau integrasi belum selesai.
4. Pertahankan nama resmi credential, organisasi, teknologi, dan proyek.

## Dokumentasi blog

Blog mempunyai alur terpisah dari portfolio root:

- [WRITE-POSTS.md](WRITE-POSTS.md) untuk menulis postingan;
- [UPDATE-FUWARI.md](UPDATE-FUWARI.md) untuk memperbarui template blog.

Jangan mengubah blog bersamaan dengan migrasi besar portfolio kecuali memang direncanakan sebagai pekerjaan terpisah.

## Kembali ke gambaran repository

Baca [README utama](../README.md) untuk arsitektur, teknologi, perintah, dan struktur repository.
