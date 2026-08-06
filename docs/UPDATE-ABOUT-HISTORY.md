# Mengisi Galeri Tentang Saya dan Riwayat

Struktur halaman sudah dapat berjalan ketika data masih kosong. Data kosong akan menampilkan keadaan netral pada Riwayat dan tidak menampilkan ikon gambar rusak pada Tentang Saya.

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

## Menambahkan pengalaman atau pendidikan

Edit file sesuai bahasa:

- `assets/data/history/history-id.json`
- `assets/data/history/history-en.json`
- `assets/data/history/history-ja.json`
- `assets/data/history/history-zh.json`

Format data:

```json
{
  "experience": [
    {
      "start": "2024-01",
      "end": "2024-08",
      "title": "Nama pekerjaan",
      "organization": "Nama tempat kerja",
      "location": "Kota",
      "description": "Ringkasan tugas atau hasil kerja."
    }
  ],
  "education": [
    {
      "start": "2018-07",
      "end": "2021-06",
      "title": "Teknik Komputer dan Jaringan",
      "organization": "Nama sekolah",
      "description": "Ringkasan pendidikan."
    }
  ]
}
```

Gunakan format tanggal `YYYY-MM`. Untuk kegiatan yang masih berlangsung, isi `end` dengan `null` atau hapus properti tersebut. Tampilan otomatis diurutkan dari yang terbaru ke yang terlama.

`organization`, `location`, dan `description` bersifat opsional. Jangan menambah koma setelah item terakhir karena file JSON akan gagal dibaca.
