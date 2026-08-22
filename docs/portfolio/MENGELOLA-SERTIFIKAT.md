# Menambah dan Merawat Sertifikat

Panduan ini digunakan untuk menambah sertifikat, memperbaiki deskripsi, mengatur sertifikat unggulan, dan memeriksa masa berlaku.

## Tujuan copywriting sertifikat

Deskripsi sertifikat harus menjelaskan ruang lingkup kompetensi atau pembelajaran tanpa mengubah credential menjadi klaim pengalaman kerja.

Gunakan pola berikut:

```text
[jenis atau tingkat pembelajaran] + [topik utama] + [konteks penerapan]
```

Contoh yang terlalu kaku:

> Mencakup HTML, CSS, Flexbox, Grid, dan desain responsif.

Contoh yang lebih alami:

> Fondasi pengembangan web yang membahas HTML semantik, CSS, Flexbox, Grid, dan penerapan layout responsif untuk beragam ukuran layar.

Untuk deskripsi bahasa Inggris, hindari membuka setiap kartu dengan kata yang sama seperti `Covered`. Gunakan variasi yang tetap faktual, misalnya `A foundation in...`, `An introduction to...`, atau `Intermediate study focused on...`. Variasi bahasa tidak boleh mengubah tingkat kursus menjadi klaim keahlian.

## Batas klaim

- Pertahankan nama resmi sertifikat.
- Tulis materi yang dapat dibuktikan dari silabus, sertifikat, atau dokumen pelatihan.
- “Mempelajari” atau “membahas” tidak sama dengan “menguasai”.
- Jangan menyebut diri ahli hanya karena menyelesaikan satu kelas.
- Jangan mengklaim sertifikasi profesi jika dokumennya hanya sertifikat kelulusan kelas.
- Jangan menyebut credential masih aktif jika sudah kedaluwarsa.

Sertifikat BNSP boleh disebut sertifikasi kompetensi. Sertifikat kelas Dicoding ditulis sebagai program atau pembelajaran, kecuali credential resminya menyatakan hal lain.

## Lokasi data

```text
assets/data/certificates/certificates-id.json
assets/data/certificates/certificates-en.json
assets/data/certificates/certificates-ja.json
assets/data/certificates/certificates-zh.json
```

Setiap sertifikat hanya ditempatkan pada satu katalog bahasa. Jangan menerjemahkan lalu menduplikasi credential yang sama ke katalog lain. Item tanpa judul tidak ditampilkan.

## Struktur sertifikat

```json
{
  "title": "Nama resmi sertifikat",
  "description": "Ruang lingkup kompetensi atau pembelajaran.",
  "category": "web-development",
  "imageUrl": "../assets/img/certificates/id/nama-sertifikat.webp",
  "fullImageUrl": "../assets/img/certificates/id/nama-sertifikat.webp",
  "link": "https://alamat-verifikasi.example",
  "tanggalTerbit": "2026-08-10",
  "tanggalKadaluarsa": "2029-08-10",
  "isFeatured": false
}
```

| Field | Aturan |
| --- | --- |
| `title` | Salin nama credential, termasuk kapitalisasi yang memang resmi. |
| `description` | Gunakan satu kalimat ringkas, faktual, dan diakhiri tanda baca. |
| `category` | Gunakan ID kategori yang tersedia pada keempat katalog bahasa. |
| `imageUrl` | Path gambar kartu sertifikat. |
| `fullImageUrl` | Gunakan jika kartu perlu membuka gambar penuh dan tidak ada link verifikasi. |
| `link` | Gunakan URL verifikasi publik bila tersedia. |
| `tanggalTerbit` | Gunakan format `YYYY-MM-DD`. |
| `tanggalKadaluarsa` | Gunakan `YYYY-MM-DD`; hapus field atau isi string kosong jika tidak kedaluwarsa. |
| `isFeatured` | Pilih hanya credential yang paling relevan untuk posisi yang dituju. |

Jangan menyimpan nomor identitas, credential ID sensitif, tanda tangan mentah, atau data pribadi yang tidak diperlukan.

## Kategori sertifikat

Katalog kategori berada di:

```text
assets/data/categories/certificates/certificate-categories-id.json
assets/data/categories/certificates/certificate-categories-en.json
assets/data/categories/certificates/certificate-categories-ja.json
assets/data/categories/certificates/certificate-categories-zh.json
```

Jika menambah kategori, gunakan ID dan urutan yang sama pada keempat file. Label boleh diterjemahkan.

## Menyiapkan gambar

Simpan gambar di:

```text
assets/img/certificates/<bahasa>/
```

Aturan gambar:

- gunakan nama file huruf kecil dan tanda minus;
- WebP disarankan untuk mengurangi ukuran;
- pastikan credential masih dapat dibaca saat dibuka penuh;
- sensor nomor identitas atau data pribadi yang tidak perlu;
- jangan mengubah isi credential saat melakukan optimasi gambar;
- gunakan orientasi dan rasio yang sesuai dengan dokumen asli.

## Memilih sertifikat unggulan

Beranda menampilkan maksimal tiga sertifikat unggulan. Prioritaskan:

1. sertifikasi kompetensi atau credential yang paling kuat;
2. credential yang relevan dengan posisi target;
3. credential terbaru yang masih aktif;
4. kombinasi yang tidak mengulang topik yang sama.

Jangan menjadikan semua sertifikat unggulan. Jika tidak ada `isFeatured: true`, sistem memakai urutan tanggal terbaru sebagai fallback.

Sertifikat kursus singkat seperti Sololearn tetap boleh disimpan pada halaman lengkap sebagai arsip pembelajaran. Namun, jangan memenuhi beranda dengannya. Untuk tampilan unggulan, dahulukan sertifikasi kompetensi, credential yang lebih kuat, atau pelatihan yang paling dekat dengan posisi target. Banyaknya sertifikat bukan pengganti bukti proyek dan pengalaman menerapkan materi.

## Memeriksa masa berlaku

Setiap bulan, cari credential yang akan kedaluwarsa dalam 60 hari. Setelah kedaluwarsa:

- jangan menghapus credential secara otomatis;
- pastikan UI menampilkan status yang benar;
- pindahkan dari daftar unggulan jika sudah tidak mewakili kompetensi terbaru;
- tambahkan credential pengganti hanya jika benar-benar diperoleh.

## Urutan menambah sertifikat

1. Tambahkan dan optimalkan gambar.
2. Tambahkan record pada file bahasa yang sesuai.
3. Isi tanggal dari credential, bukan dari ingatan.
4. Buka link verifikasi dalam mode incognito.
5. Tinjau deskripsi dan batas klaim.
6. Perbarui baseline audit.
7. Jalankan verifikasi lengkap.
8. Periksa kartu dan gambar penuh pada desktop serta mobile.

## Baseline audit

```bash
git diff -- assets/data/certificates assets/img/certificates
npm run audit:baseline:update
git diff -- tests/fixtures/portfolio-data-baseline.json
npm run verify
```

Hash dataset disimpan dalam baseline. Karena itu, perubahan deskripsi yang disengaja tetap perlu diterima melalui `audit:baseline:update` setelah diff diperiksa.

## Checklist sertifikat

- [ ] Nama credential tidak diubah.
- [ ] Deskripsi faktual, tidak kaku, dan tidak berlebihan.
- [ ] Kategori dan bahasa benar.
- [ ] Tanggal terbit dan kedaluwarsa sesuai dokumen.
- [ ] Link verifikasi dapat dibuka atau gambar penuh tersedia.
- [ ] Gambar tidak membocorkan data sensitif.
- [ ] Pilihan unggulan masih relevan.
- [ ] Baseline ditinjau.
- [ ] `npm run verify` lulus.
