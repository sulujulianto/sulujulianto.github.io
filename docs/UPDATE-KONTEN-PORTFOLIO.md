# Cara Memperbarui Konten Portfolio

Portfolio memakai file JSON agar konten dapat diubah tanpa menulis ulang komponen React. Bahasa yang didukung:

- `id`: Bahasa Indonesia
- `en`: English
- `ja`: 日本語
- `zh`: 中文

Data proyek dan sertifikat tiap bahasa memang boleh berbeda. Bahasa Jepang dan Mandarin tidak harus memiliki proyek yang sama dengan Bahasa Indonesia.

## Proyek

### Lokasi data kartu proyek

```text
assets/data/projects/projects-id.json
assets/data/projects/projects-en.json
assets/data/projects/projects-ja.json
assets/data/projects/projects-zh.json
```

Item tanpa judul tidak ditampilkan. Untuk bahasa yang belum memiliki proyek, array kosong `[]` juga valid.

### Struktur kartu proyek

```json
{
  "title": "Nama Proyek",
  "description": "Ringkasan yang jujur dan mudah dipahami.",
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

Arti field:

| Field | Aturan |
| --- | --- |
| `title` | Wajib dan tidak boleh kosong agar kartu tampil. |
| `description` | Jelaskan fungsi nyata, bukan promosi berlebihan. |
| `category` | Harus tersedia di katalog kategori keempat bahasa. |
| `imageUrl` | Path gambar kartu; gambar WebP disarankan. |
| `githubUrl` | Isi URL repository atau string kosong jika belum publik. |
| `liveUrl` | Isi URL demo atau string kosong jika belum ada. |
| `techStack` | Teknologi yang benar-benar digunakan dalam proyek. |
| `dateAdded` | Format `YYYY-MM-DD`; dipakai untuk urutan terbaru. |
| `isFeatured` | `true` untuk kandidat beranda; beranda mengambil maksimal tiga. |
| `slug` | Huruf kecil, angka, dan tanda minus; jangan diubah setelah dipublikasikan. |
| `status` | Hanya `published` atau `in-development`. |

### Kategori proyek

Katalog kategori berada di:

```text
assets/data/categories/projects/project-categories-<bahasa>.json
```

Semua file harus memiliki `id` yang sama dan urutan yang sama. Labelnya boleh diterjemahkan. Item `{"id":"*"}` wajib berada paling awal.

Jika menambah kategori, tambahkan ke keempat file sebelum memakai ID tersebut pada proyek.

### Proyek dalam pengembangan

Gunakan `status: "in-development"` jika studi kasus belum siap. Kartu tetap dapat tampil dengan label “Dalam pengembangan”, tetapi URL detailnya sengaja belum memiliki shell dan akan berakhir di halaman 404.

Jangan membuat shell kosong hanya agar URL memberi respons 200. Publikasikan detail setelah isinya benar-benar siap.

## Detail proyek

Proyek `published` membutuhkan bagian berikut yang saling cocok:

1. Kartu di `assets/data/projects/projects-<bahasa>.json`.
2. Artikel di `assets/data/project-details/<bahasa>/<slug>.json`.
3. Shell di `projects/<slug>/index.html`.
4. Gambar kartu dan gambar artikel.
5. URL proyek di `sitemap.xml`.

Bahasa artikel saat ini hanya `id` atau `en`, walaupun label navigasi dapat mengikuti pilihan empat bahasa.

### Struktur artikel

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
    "alt": "Deskripsi gambar utama",
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

Blok yang didukung dalam `content`:

```json
{ "type": "paragraph", "text": "Paragraf." }
```

```json
{ "type": "heading", "level": 2, "text": "Judul bagian" }
```

```json
{ "type": "list", "items": ["Poin pertama", "Poin kedua"] }
```

```json
{
  "type": "image",
  "src": "/assets/img/project-details/nama-proyek/gambar.webp",
  "alt": "Deskripsi gambar",
  "caption": "Keterangan opsional"
}
```

```json
{ "type": "code", "language": "js", "code": "console.log('contoh');" }
```

```json
{
  "type": "callout",
  "title": "Catatan penting",
  "text": "Batasan, status, atau konteks yang perlu diketahui."
}
```

Gunakan `null` untuk tombol GitHub atau Live Demo yang belum tersedia. Tulis keterbatasan secara terbuka; jangan mengklaim deployment, keamanan, pengujian, atau skala yang belum dibuktikan.

### Membuat shell detail

Salin shell proyek yang bahasa artikelnya sama, lalu ganti:

- `<title>` dan description;
- canonical, Open Graph, dan Twitter metadata;
- URL serta ukuran gambar preview;
- `data-project-slug`;
- `data-content-locale`;
- bahasa awal pada `data-locale` bila diperlukan.

Jangan mengubah struktur header, pemilih bahasa, footer, atau urutan script tanpa alasan khusus. Setelah membuat shell, tambahkan URL kanonis ke `sitemap.xml`.

## Sertifikat

### Lokasi data

```text
assets/data/certificates/certificates-id.json
assets/data/certificates/certificates-en.json
assets/data/certificates/certificates-ja.json
assets/data/certificates/certificates-zh.json
```

### Struktur sertifikat

```json
{
  "title": "Nama Sertifikat",
  "description": "Kompetensi atau materi yang benar-benar tercakup.",
  "category": "web-development",
  "imageUrl": "../assets/img/certificates/id/nama-sertifikat.webp",
  "fullImageUrl": "../assets/img/certificates/id/nama-sertifikat.webp",
  "link": "https://alamat-verifikasi.example",
  "tanggalTerbit": "2026-08-10",
  "tanggalKadaluarsa": "2029-08-10",
  "isFeatured": false
}
```

Aturan:

- `title` wajib agar kartu tampil.
- `tanggalTerbit` dan `tanggalKadaluarsa` memakai `YYYY-MM-DD`.
- Jika sertifikat tidak kedaluwarsa, hapus `tanggalKadaluarsa` atau isi string kosong.
- Jika ada URL verifikasi, isi `link`.
- Jika tidak ada URL, gunakan `fullImageUrl` agar kartu membuka gambar penuh.
- `isFeatured: true` dipakai untuk maksimal tiga sertifikat utama di beranda.
- Jangan memasukkan credential ID rahasia atau data pribadi yang tidak perlu.

Kategori sertifikat berada di `assets/data/categories/certificates/`. Jika menambah kategori baru, tambahkan ID yang sama dan urutan yang sama ke keempat bahasa.

Simpan gambar sertifikat di `assets/img/certificates/<bahasa>/` dan gunakan nama file huruf kecil dengan tanda minus.

## Riwayat

Riwayat dipisahkan menjadi dua jenis:

```text
assets/data/history/experience/
assets/data/history/education-and-training/
```

Setiap jenis memiliki file `id`, `en`, `ja`, dan `zh`. Fakta utama seperti `id`, tanggal, organisasi, dan urutan harus konsisten; teks deskripsi boleh diterjemahkan.

### Struktur entri riwayat

```json
{
  "id": "nama-entri-unik",
  "start": "2025-11",
  "end": null,
  "title": "Nama pekerjaan atau program",
  "organization": "Nama organisasi",
  "location": "Kota, Negara",
  "description": "Ringkasan yang mudah dipahami.",
  "highlights": [
    "Hasil atau tanggung jawab pertama.",
    "Hasil atau tanggung jawab kedua."
  ],
  "links": [
    {
      "label": "Nama tautan",
      "url": "https://example.com"
    }
  ]
}
```

Aturan tanggal:

- pakai `YYYY-MM` jika bulan diketahui;
- pakai `YYYY` jika hanya tahun yang diketahui;
- pakai `null` pada `end` jika masih berlangsung;
- jangan mengarang bulan agar urutannya terlihat lebih presisi.

Gunakan `id` yang unik dan sama pada keempat bahasa. Untuk proyek rahasia, jangan menulis nama klien, domain, lokasi spesifik, kode internal, atau detail lain yang melanggar kerahasiaan.

## Keahlian dan teknologi

Daftar utama berada di:

```text
assets/data/skills/skills.json
```

Label terjemahan berada di bagian `pages.home.skills` dalam:

```text
assets/data/locales/ui-<bahasa>.json
```

### Kapan teknologi boleh ditambahkan?

Tambahkan sebagai keahlian biasa jika ada bukti penggunaan nyata, misalnya proyek, pengalaman kerja, pelatihan mendalam, atau sertifikat yang relevan.

Jika masih dipelajari secara aktif, gunakan:

```json
"status": "activeDevelopment"
```

Jika baru direncanakan, gunakan:

```json
"status": "planned"
```

Jangan menambahkan teknologi hanya karena pernah mengikuti tutorial singkat. Tinjau daftar sebulan sekali dan ubah status hanya ketika bukti sudah berubah.

### Menambah ikon keahlian

1. Tambahkan simbol SVG ke `assets/icons/skills.svg` dengan `id` unik.
2. Tambahkan item pada group yang tepat di `skills.json`.
3. Gunakan ID simbol tersebut pada field `icon`.
4. Tambahkan `labelKey` serta terjemahannya jika label perlu diterjemahkan.
5. Jalankan `npm run verify` untuk memastikan semua ikon ditemukan.

## Konten lain

### Teks antarmuka empat bahasa

Lokasi:

```text
assets/data/locales/ui-id.json
assets/data/locales/ui-en.json
assets/data/locales/ui-ja.json
assets/data/locales/ui-zh.json
```

Keempat file harus memiliki path key, urutan key, dan tipe nilai yang sama. Jika menambah satu key, tambahkan pada keempat file. Jangan menyimpan HTML, CSS class, data proyek, atau data sertifikat di katalog ini.

Teks fallback Bahasa Indonesia tetap harus terlihat di HTML sebelum JavaScript selesai dimuat.

### Foto profil dan galeri Tentang Saya

- Foto profil utama: `assets/img/about-me/Sulu.webp`.
- Gambar galeri: `assets/img/about-me/gallery/`.
- Daftar galeri: `assets/data/about/about-images.json`.

Contoh:

```json
{
  "images": [
    {
      "src": "assets/img/about-me/gallery/kegiatan-01.webp",
      "alt": "Deskripsi isi gambar",
      "caption": "Keterangan opsional"
    }
  ]
}
```

`alt` menjelaskan isi gambar untuk aksesibilitas; jangan mengisinya dengan nama file.

### CV

- Indonesia: `assets/data/CV/ID/CV_SuluEdwardJulianto.pdf`
- English: `assets/data/CV/EN/CV_SuluEdwardJulianto.pdf`

Bahasa Jepang dan Mandarin saat ini memakai CV Indonesia. Mapping berada di `assets/js/locale-manager.ts`.

Pertahankan nama file agar tautan lama tetap bekerja. Setelah mengganti PDF, periksa tombol unduh dalam empat bahasa.

### Social preview

- File yang dipublikasikan: `assets/img/social/portfolio-preview.png`.
- Source desain: `assets/img/social/portfolio-preview.svg`.
- Foto source desain: `assets/img/social/profile-card.png`.

PNG publik harus berukuran 1200 × 630. Jika source diubah, ekspor PNG baru dan pastikan metadata pada tiga halaman root tetap menunjuk ke file tersebut.

## Baseline audit data

Audit menyimpan snapshot data proyek, sertifikat, dan kategori di:

```text
tests/fixtures/portfolio-data-baseline.json
```

Tujuannya agar perubahan konten penting tidak terjadi tanpa terlihat. Karena itu, perubahan data yang disengaja akan membuat audit gagal sampai baseline diterima.

Urutan yang benar:

```bash
# 1. Edit dan tinjau JSON serta asetnya.
git diff -- assets/data assets/img

# 2. Terima hanya perubahan data yang memang disengaja.
npm run audit:baseline:update

# 3. Tinjau snapshot yang berubah.
git diff -- tests/fixtures/portfolio-data-baseline.json

# 4. Jalankan seluruh pemeriksaan.
npm run verify
```

Jangan menjalankan `audit:baseline:update` untuk menyembunyikan error yang belum dipahami. Perintah akan menolak kategori tidak valid, aset wajib yang hilang, dan aset lokal hilang yang tidak ada dalam daftar pengecualian.

## Checklist setelah memperbarui konten

- [ ] JSON valid dan tidak memiliki koma terakhir.
- [ ] Bahasa, kategori, slug, tanggal, dan status benar.
- [ ] Gambar ada dan path-nya benar.
- [ ] Klaim dapat dibuktikan dan keterbatasan tetap ditulis jujur.
- [ ] Baseline audit diperbarui hanya jika data penting berubah.
- [ ] `npm run verify` lulus.
- [ ] Tampilan desktop/mobile serta terang/gelap diperiksa.
- [ ] Bahasa yang diubah diperiksa di browser.
- [ ] Detail proyek dan sitemap diperiksa jika menambah proyek `published`.
