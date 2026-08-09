# Pusat Dokumentasi Portfolio

Gunakan halaman ini sebagai daftar isi. Anda tidak perlu mengingat semua lokasi file; pilih pekerjaan yang ingin dilakukan, lalu buka panduannya.

## Saya ingin melakukan apa?

| Kebutuhan | Baca |
| --- | --- |
| Menyiapkan repository di komputer baru | [SETUP-BARU.md](SETUP-BARU.md) |
| Mengubah warna, ukuran, jarak, layout, HTML, atau TypeScript | [ALUR-PENGEMBANGAN.md](ALUR-PENGEMBANGAN.md) |
| Menambah atau mengubah proyek | [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md#proyek) |
| Menulis detail atau studi kasus proyek | [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md#detail-proyek) |
| Menambah sertifikat | [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md#sertifikat) |
| Mengubah pengalaman, pendidikan, atau pelatihan | [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md#riwayat) |
| Memperbarui daftar teknologi/keahlian | [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md#keahlian-dan-teknologi) |
| Mengubah teks empat bahasa, CV, foto, atau metadata | [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md#konten-lain) |
| Melakukan pemeriksaan rutin | [PEMERIKSAAN-BULANAN.md](PEMERIKSAAN-BULANAN.md) |
| Menulis artikel blog | [WRITE-POSTS.md](WRITE-POSTS.md) |
| Memperbarui template Fuwari | [UPDATE-FUWARI.md](UPDATE-FUWARI.md) |
| Mengatasi error | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

## Empat aturan utama

1. Gunakan branch baru untuk setiap kelompok perubahan.
2. Jangan mengedit file hasil build secara manual.
3. Jalankan `npm run verify` sebelum commit.
4. Baca `git diff` sebelum menerima perubahan baseline atau melakukan commit.

## Peta source dan hasil build

| Yang ingin diubah | Edit source | Hasil build yang ikut di-commit |
| --- | --- | --- |
| Tampilan portfolio | `assets/css/main.css` dan class di HTML/TSX | `assets/css/output.css` |
| Logika portfolio | `assets/js/*.ts` dan `assets/js/*.tsx` | `assets/js/dist/*.js` |
| Data portfolio | `assets/data/**/*.json` | Tidak ada build; audit tetap wajib |
| Blog | `blog-fuwari/` | `blog/` |

## Checklist singkat sebelum Pull Request

```bash
npm run verify
git diff --check
git status --short --branch
```

Jika blog ikut berubah:

```bash
npm run blog:doctor
npm run blog:build
```

Setelah itu periksa situs lokal dalam mode terang dan gelap, pada ukuran desktop dan mobile, serta minimal dalam Bahasa Indonesia dan English.
