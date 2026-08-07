# Mengisi Galeri Tentang Saya dan Riwayat

Komponen Riwayat tetap menampilkan keadaan netral jika suatu dataset belum memiliki entri, sedangkan galeri Tentang Saya tidak menampilkan ikon gambar rusak ketika datanya kosong.

## Menambahkan gambar Tentang Saya

1. Simpan gambar di `assets/img/about-me/gallery/`.
2. Buka `assets/data/about/about-images.json`.
3. Tambahkan satu objek untuk setiap gambar.

Contoh:

```json
{
  "images": [
    {
      "src": "assets/img/about-me/gallery/kegiatan-01.webp",
      "alt": "Deskripsi singkat isi gambar",
      "caption": "Keterangan opsional"
    },
    {
      "src": "assets/img/about-me/gallery/kegiatan-02.webp",
      "alt": "Deskripsi singkat isi gambar"
    }
  ]
}
```

Galeri selalu memakai dua kolom. Lebar kotak Tentang Saya tidak berubah; tinggi kotak bertambah per baris. Enam gambar akan tampil sebagai tiga baris. `caption` boleh dihapus, tetapi `alt` sebaiknya selalu diisi.

## Menambahkan pengalaman

Edit file sesuai bahasa di folder `assets/data/history/experience/`:

- `experience-id.json`
- `experience-en.json`
- `experience-ja.json`
- `experience-zh.json`

## Menambahkan pendidikan atau pelatihan

Edit file sesuai bahasa di folder `assets/data/history/education-and-training/`:

- `education-and-training-id.json`
- `education-and-training-en.json`
- `education-and-training-ja.json`
- `education-and-training-zh.json`

Setiap file berisi array entri dengan format berikut:

```json
[
  {
    "id": "nama-entri-unik",
    "start": "2024-01",
    "end": "2024-08",
    "title": "Nama pekerjaan atau program",
    "organization": "Nama tempat kerja atau institusi",
    "location": "Kota, Negara",
    "description": "Ringkasan tugas atau pembelajaran.",
    "highlights": [
      "Poin pendukung pertama.",
      "Poin pendukung kedua."
    ],
    "links": [
      {
        "label": "Teks tautan",
        "url": "https://example.com"
      }
    ]
  },
  {
    "id": "pendidikan-tanpa-bulan",
    "start": "2018",
    "end": "2021",
    "title": "Teknik Komputer dan Jaringan",
    "organization": "Nama sekolah",
    "location": "Kota, Negara"
  }
]
```

Gunakan format tanggal `YYYY-MM` jika bulannya diketahui. Jika hanya tahunnya yang diketahui, gunakan `YYYY`; jangan mengarang bulan. Untuk kegiatan yang masih berlangsung, isi `end` dengan `null` atau hapus properti tersebut.

Timeline dikelompokkan dan diurutkan berdasarkan **tahun mulai**, dari yang terbaru. Tampilan ringkas selalu menunjukkan nama pekerjaan/program, nama tempat, dan lokasi. `description`, `highlights`, dan `links` baru muncul setelah entri dibuka.

`id`, `start`, `title`, `organization`, dan `location` wajib diisi. `end`, `description`, `highlights`, dan `links` bersifat opsional. Gunakan `id` yang unik dan konsisten pada keempat bahasa. Jangan menambah koma setelah item terakhir karena file JSON akan gagal dibaca.
