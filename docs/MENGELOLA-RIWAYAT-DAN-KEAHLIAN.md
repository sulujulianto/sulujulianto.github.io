# Mengelola Riwayat dan Keahlian

Panduan ini digunakan saat memperbarui pengalaman, pendidikan, pelatihan, serta daftar teknologi. Fokus utamanya adalah menjaga fakta tetap konsisten dan memastikan setiap klaim keahlian mempunyai bukti.

## Lokasi data riwayat

Riwayat dipisahkan menjadi:

```text
assets/data/history/experience/
assets/data/history/education-and-training/
```

Setiap folder memiliki file `id`, `en`, `ja`, dan `zh`. Fakta seperti ID, organisasi, tanggal, dan urutan harus tetap konsisten pada bahasa yang memuat record yang sama. Teksnya boleh diterjemahkan.

## Struktur record riwayat

```json
{
  "id": "nama-entri-unik",
  "start": "2025-11",
  "end": null,
  "title": "Nama pekerjaan atau program",
  "organization": "Nama organisasi",
  "location": "Kota, Negara",
  "description": "Ringkasan peran atau program.",
  "highlights": [
    "Tanggung jawab atau hasil pertama.",
    "Tanggung jawab atau hasil kedua.",
    "Tanggung jawab atau hasil ketiga."
  ],
  "links": [
    {
      "label": "Nama tautan",
      "url": "https://example.com"
    }
  ]
}
```

## Menulis riwayat kerja

Deskripsi menjawab “peran ini tentang apa?”, sedangkan highlights menjawab “apa yang dikerjakan atau dihasilkan?”.

Gunakan pola highlight:

```text
[tindakan] + [objek atau tanggung jawab] + [konteks atau hasil yang dapat dibuktikan]
```

Contoh:

> Menangani kendala ringan komputer pelanggan dan menjaga perangkat tetap siap digunakan selama operasional warnet.

Jangan mengarang angka, jabatan formal, nama klien, durasi kontrak, atau dampak bisnis. Jika pekerjaan bersifat lepas tanpa kontrak, tulis statusnya secara wajar tanpa menciptakan hubungan kerja yang tidak pernah ada.

## Aturan tanggal

- Gunakan `YYYY-MM` jika bulan diketahui.
- Gunakan `YYYY` jika hanya tahun yang diketahui.
- Gunakan `null` pada `end` jika masih berlangsung.
- Jangan menebak bulan hanya agar urutan terlihat lebih presisi.
- Jika terjadi jeda, biarkan data menunjukkan jeda tersebut.

## Informasi rahasia

Untuk pekerjaan atau proyek rahasia, jangan mencantumkan:

- nama klien;
- domain atau URL internal;
- lokasi yang dapat mengungkap identitas klien;
- nama sistem internal;
- credential, token, atau data pengguna;
- detail proses yang terikat kerahasiaan.

Tuliskan jenis sistem, tanggung jawab, dan keputusan teknis pada tingkat yang tetap informatif tanpa membuka identitas.

## Lokasi data keahlian

Daftar teknologi berada di:

```text
assets/data/skills/skills.json
```

Label antarmuka untuk setiap bahasa berada pada `pages.home.skills` dalam:

```text
assets/data/locales/ui-id.json
assets/data/locales/ui-en.json
assets/data/locales/ui-ja.json
assets/data/locales/ui-zh.json
```

## Kapan teknologi boleh ditambahkan?

Keahlian biasa membutuhkan minimal satu bukti nyata:

- digunakan dalam proyek yang dapat diperiksa;
- digunakan dalam pengalaman kerja;
- dipakai dalam pelatihan yang cukup mendalam;
- didukung sertifikat yang relevan;
- dapat dijelaskan dan didemonstrasikan tanpa sekadar membaca ulang tutorial.

Jika masih dipelajari aktif, gunakan:

```json
"status": "activeDevelopment"
```

Jika baru direncanakan, gunakan:

```json
"status": "planned"
```

Jangan menaikkan status hanya karena teknologi terlihat populer atau tersedia pada daftar ikon.

## Menilai kekuatan bukti

Gunakan urutan berikut:

1. proyek publik dengan kode, test, dan dokumentasi;
2. penggunaan nyata dalam pengalaman kerja;
3. proyek latihan yang diselesaikan sendiri;
4. sertifikat atau pelatihan;
5. tutorial singkat atau rencana belajar.

Sertifikat mendukung klaim pembelajaran, tetapi tidak otomatis membuktikan pengalaman produksi.

## Menambah ikon keahlian

1. Tambahkan simbol SVG ke `assets/icons/skills.svg` dengan ID unik.
2. Tambahkan item pada group yang sesuai dalam `skills.json`.
3. Gunakan ID simbol tersebut pada field `icon`.
4. Tambahkan `labelKey` dan terjemahan jika diperlukan.
5. Jalankan `npm run test:skills` dan `npm run verify`.

Gunakan sprite lokal. Jangan menambah permintaan jaringan baru hanya untuk menampilkan ikon.

## Checklist riwayat

- [ ] ID unik dan konsisten.
- [ ] Tanggal memakai presisi yang benar.
- [ ] Organisasi, lokasi, dan status sesuai fakta.
- [ ] Deskripsi dan highlights tidak mengulang kalimat yang sama.
- [ ] Tidak ada identitas rahasia atau data pribadi yang tidak perlu.
- [ ] Tautan dapat dibuka.
- [ ] Bahasa yang diubah tetap membawa fakta yang sama.

## Checklist keahlian

- [ ] Setiap teknologi memiliki bukti.
- [ ] Status `activeDevelopment` dan `planned` digunakan secara jujur.
- [ ] Group tetap seimbang dan mudah dipindai.
- [ ] Ikon tersedia dalam sprite lokal.
- [ ] Label terjemahan lengkap.
- [ ] `npm run verify` lulus.
