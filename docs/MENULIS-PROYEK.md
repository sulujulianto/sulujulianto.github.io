# Menulis dan Menerbitkan Proyek

Panduan ini digunakan untuk menambah kartu proyek, menyusun copywriting, dan menerbitkan studi kasus. Tujuannya bukan membuat proyek terdengar sebesar mungkin, melainkan membantu pembaca memahami masalah, solusi, bukti teknis, dan batasannya dengan cepat.

## Prinsip utama

Tulisan proyek yang kuat menjawab lima pertanyaan:

1. Masalah apa yang ingin diselesaikan?
2. Siapa yang terbantu oleh proyek tersebut?
3. Apa yang benar-benar dapat dilakukan aplikasinya?
4. Keputusan teknis apa yang penting?
5. Apa yang belum selesai atau belum dibuktikan?

Hindari kata seperti “revolusioner”, “sempurna”, “terbaik”, “enterprise-grade”, atau “production-ready” tanpa bukti yang jelas. Jumlah teknologi bukan ukuran kualitas proyek.

## Menulis deskripsi kartu

Gunakan satu atau dua kalimat dengan urutan:

```text
[fungsi utama] + [pengguna atau masalah] + [pembeda atau batasan penting]
```

Contoh yang lemah:

> Aplikasi canggih berbasis AI dengan teknologi modern dan fitur lengkap.

Masalahnya: tidak menjelaskan fungsi, bukti, pengguna, maupun batasan.

Contoh yang lebih baik:

> Aplikasi evaluasi kesiapan kerja yang mengubah data profil menjadi penilaian terstruktur dan saran perbaikan berbasis bukti. Analisis AI tersedia melalui integrasi Gemini atau OpenAI, sedangkan profil demo tetap deterministik untuk pengujian.

Sebelum menyimpan deskripsi, periksa:

- apakah setiap klaim dapat ditemukan pada repository atau demo;
- apakah status deployment ditulis dengan benar;
- apakah kata “AI”, “aman”, “real-time”, atau “otomatis” dijelaskan maknanya;
- apakah deskripsi tetap dapat dipahami pembaca nonteknis.

## Lokasi kartu proyek

```text
assets/data/projects/projects-id.json
assets/data/projects/projects-en.json
assets/data/projects/projects-ja.json
assets/data/projects/projects-zh.json
```

Setiap proyek hanya ditempatkan pada satu katalog bahasa. Jangan menerjemahkan lalu menduplikasi proyek yang sama ke katalog lain. Item tanpa judul dianggap placeholder dan tidak ditampilkan.

## Struktur kartu proyek

```json
{
  "title": "Nama Proyek",
  "description": "Ringkasan fungsi dan konteks proyek.",
  "category": "fullstack-web",
  "imageUrl": "../assets/img/projects/id/nama-proyek.webp",
  "githubUrl": "https://github.com/username/repository",
  "liveUrl": "",
  "techStack": ["TypeScript", "React", "PostgreSQL"],
  "dateAdded": "2026-08-10",
  "isFeatured": false,
  "slug": "nama-proyek",
  "status": "published"
}
```

| Field | Aturan |
| --- | --- |
| `title` | Gunakan nama resmi proyek. Wajib diisi agar kartu tampil. |
| `description` | Jelaskan fungsi nyata dan konteksnya secara ringkas. |
| `category` | Gunakan ID yang tersedia dalam katalog kategori keempat bahasa. |
| `imageUrl` | Gunakan path aset lokal; WebP disarankan. |
| `githubUrl` | Isi URL repository publik atau string kosong. |
| `liveUrl` | Isi hanya jika demo benar-benar dapat diakses. |
| `techStack` | Masukkan teknologi yang digunakan, bukan yang baru direncanakan. |
| `dateAdded` | Gunakan `YYYY-MM-DD`; nilai ini menentukan urutan terbaru. |
| `isFeatured` | Jadikan `true` hanya untuk kandidat tiga proyek utama. |
| `slug` | Gunakan huruf kecil, angka, dan tanda minus. Jangan ubah setelah publikasi. |
| `status` | Hanya `published` atau `in-development`. |

## Menentukan status

Gunakan `in-development` jika artikel, aset, repository, atau fungsi utama belum siap diperiksa publik. Kartu tetap dapat tampil dengan label pengembangan, tetapi halaman detail sengaja belum dibuat.

Gunakan `published` hanya jika seluruh bagian berikut tersedia:

1. kartu proyek;
2. artikel JSON;
3. shell HTML detail;
4. gambar yang dirujuk;
5. tautan yang valid;
6. entri sitemap.

Jangan membuat shell kosong untuk menghindari 404. Status yang jujur lebih baik daripada halaman detail yang tidak memberikan informasi.

## Kategori proyek

Kategori berada di:

```text
assets/data/categories/projects/project-categories-id.json
assets/data/categories/projects/project-categories-en.json
assets/data/categories/projects/project-categories-ja.json
assets/data/categories/projects/project-categories-zh.json
```

Keempat file harus memiliki ID dan urutan yang sama. Label boleh diterjemahkan. Item dengan ID `*` harus tetap berada pada urutan pertama.

## Struktur studi kasus

Studi kasus sebaiknya mengikuti urutan berikut:

1. **Ringkasan:** satu paragraf tentang hasil yang dibangun.
2. **Latar belakang:** masalah dan alasan proyek dibuat.
3. **Tujuan dan ruang lingkup:** siapa pengguna dan apa yang termasuk atau tidak termasuk.
4. **Solusi:** alur utama dari sudut pandang pengguna.
5. **Arsitektur dan teknologi:** alasan memilih komponen penting, bukan sekadar daftar stack.
6. **Keputusan teknis:** trade-off, validasi, penyimpanan, keamanan, atau integrasi yang relevan.
7. **Pengujian dan kualitas:** sebutkan test atau CI yang benar-benar tersedia.
8. **Keterbatasan:** fitur yang belum selesai, asumsi, dan risiko yang masih ada.
9. **Tautan:** repository dan demo bila tersedia.

Tidak semua proyek memerlukan sembilan heading terpisah. Gabungkan bagian yang pendek, tetapi jangan menghilangkan keterbatasan hanya agar tulisan terlihat lebih kuat.

## Struktur data studi kasus

Lokasi artikel:

```text
assets/data/project-details/<bahasa>/<slug>.json
```

Struktur utama:

```json
{
  "version": 1,
  "slug": "nama-proyek",
  "contentLanguage": "id",
  "title": "Nama Proyek",
  "summary": "Ringkasan studi kasus.",
  "category": "fullstack-web",
  "hero": {
    "src": "/assets/img/projects/id/nama-proyek.webp",
    "alt": "Tampilan utama aplikasi Nama Proyek",
    "caption": "Keterangan opsional"
  },
  "techStack": ["TypeScript", "React"],
  "content": [],
  "links": {
    "github": "https://github.com/username/repository",
    "liveDemo": null
  }
}
```

Gunakan `null` jika tautan GitHub atau Live Demo tidak tersedia. Jangan menggunakan URL contoh pada konten yang akan dipublikasikan.

## Blok artikel yang didukung

Paragraf:

```json
{ "type": "paragraph", "text": "Isi paragraf." }
```

Heading:

```json
{ "type": "heading", "level": 2, "text": "Judul bagian" }
```

Daftar:

```json
{ "type": "list", "items": ["Poin pertama", "Poin kedua"] }
```

Gambar:

```json
{
  "type": "image",
  "src": "/assets/img/project-details/nama-proyek/gambar.webp",
  "alt": "Deskripsi isi gambar",
  "caption": "Keterangan opsional"
}
```

Kode:

```json
{ "type": "code", "language": "js", "code": "console.log('contoh');" }
```

Catatan:

```json
{
  "type": "callout",
  "title": "Keterbatasan saat ini",
  "text": "Jelaskan batasan atau status yang perlu diketahui."
}
```

Teks artikel tidak boleh berisi HTML mentah, script, style, atau class CSS.

## Shell detail dan metadata

Setiap proyek `published` membutuhkan:

```text
projects/<slug>/index.html
```

Salin shell dari proyek dengan bahasa artikel yang sama, lalu perbarui:

- `<title>` dan meta description;
- canonical URL;
- Open Graph dan Twitter metadata;
- gambar preview dan dimensinya;
- `data-project-slug`;
- `data-content-locale`;
- entri kanonis pada `sitemap.xml`.

Jangan mengubah header, footer, pemilih bahasa, atau urutan script apabila perubahan hanya berkaitan dengan konten proyek.

## Gambar proyek

- Gunakan nama file huruf kecil dengan tanda minus.
- Gunakan WebP untuk gambar kartu dan screenshot jika memungkinkan.
- Pastikan teks pada screenshot tetap terbaca.
- Hapus token, email pribadi, credential, dan data pengguna.
- Isi `alt` dengan isi atau fungsi gambar, bukan nama file.
- Jangan mengandalkan screenshot sebagai satu-satunya penjelasan fitur.

## Baseline audit

Perubahan data proyek akan mengubah baseline. Urutan yang benar:

```bash
git diff -- assets/data/projects assets/data/project-details assets/img/projects
npm run audit:baseline:update
git diff -- tests/fixtures/portfolio-data-baseline.json
npm run verify
```

Jangan menjalankan pembaruan baseline untuk menyembunyikan typo, kategori tidak valid, atau aset yang lupa ditambahkan.

## Checklist proyek

- [ ] Nama, status, kategori, tanggal, slug, dan tautan benar.
- [ ] Deskripsi menjelaskan fungsi tanpa klaim berlebihan.
- [ ] Tech stack sesuai repository.
- [ ] Gambar tersedia, ringan, dan tidak membocorkan data pribadi.
- [ ] Artikel menjelaskan keputusan teknis dan keterbatasan.
- [ ] Proyek `published` memiliki artikel, shell, dan sitemap.
- [ ] Baseline ditinjau setelah diperbarui.
- [ ] `npm run verify` lulus.
- [ ] Halaman diperiksa pada desktop, mobile, mode terang, dan mode gelap.
