# Mengelola Bahasa, CV, Gambar, dan Metadata

Panduan ini digunakan untuk memperbarui teks antarmuka, pemetaan bahasa, foto, CV, metadata sosial, canonical URL, dan sitemap.

## Bahasa yang didukung

| Kode | Bahasa |
| --- | --- |
| `id` | Bahasa Indonesia |
| `en` | English |
| `ja` | 日本語 |
| `zh` | 中文 |

Alias URL lama `jp` dan `cn` hanya digunakan oleh folder redirect. Runtime utama memakai `ja` dan `zh`.

Urutan pemilihan bahasa:

1. parameter URL `?lang=`;
2. pilihan tersimpan pada `localStorage`;
3. bahasa browser;
4. fallback Bahasa Indonesia.

## Katalog teks antarmuka

```text
assets/data/locales/ui-id.json
assets/data/locales/ui-en.json
assets/data/locales/ui-ja.json
assets/data/locales/ui-zh.json
```

Keempat file harus memiliki:

- path key yang sama;
- urutan key yang sama;
- tipe nilai yang sama;
- string yang tidak kosong, kecuali pengecualian yang diuji.

Jika menambah satu key, tambahkan pada keempat katalog. Jangan menyimpan HTML, script, style, class CSS, record proyek, atau record sertifikat dalam katalog UI.

## Konten portfolio setiap bahasa memang berbeda

Data proyek dan sertifikat bukan kumpulan yang sama dalam beberapa terjemahan. Setiap karya atau credential hanya boleh berada pada satu katalog bahasa. Jangan menerjemahkan lalu menduplikasi record ke katalog lain, termasuk hanya untuk menghilangkan placeholder.

Katalog Jepang dan Mandarin boleh tetap kosong atau menggunakan placeholder sampai tersedia proyek atau sertifikat yang memang ditujukan untuk bahasa tersebut. Kekosongan yang jujur lebih baik daripada duplikasi yang mengaburkan tujuan tiap katalog.

Yang harus konsisten adalah kontrak teknis:

- format record;
- ID kategori;
- aturan tanggal;
- path data yang dimuat runtime;
- metadata bahasa dan URL.

## Teks fallback HTML

Teks Bahasa Indonesia pada HTML harus tetap bermakna sebelum JavaScript selesai dimuat. Jangan mengosongkan heading atau tombol dengan alasan nanti akan diisi katalog bahasa.

Setelah mengubah katalog:

```bash
npm run test:ui-locale
npm run verify
```

Periksa minimal bahasa yang diubah dan Bahasa Indonesia sebagai fallback.

## CV

Lokasi file:

```text
assets/data/CV/ID/CV_SuluEdwardJulianto.pdf
assets/data/CV/EN/CV_SuluEdwardJulianto.pdf
```

Pemetaan tombol CV berada di `assets/js/locale-manager.ts`. Bahasa Jepang dan Mandarin saat ini menggunakan CV Indonesia.

Saat mengganti CV:

- pertahankan nama file agar tautan lama tidak rusak;
- pastikan PDF dapat dibuka dan diunduh;
- periksa ukuran file;
- hapus metadata atau informasi pribadi yang tidak ingin dipublikasikan;
- uji tombol dalam keempat pilihan bahasa.

## Foto profil dan galeri

- Foto utama: `assets/img/about-me/Sulu.webp`.
- Gambar galeri: `assets/img/about-me/gallery/`.
- Data galeri: `assets/data/about/about-images.json`.

Contoh record:

```json
{
  "src": "assets/img/about-me/gallery/kegiatan-01.webp",
  "alt": "Deskripsi isi gambar",
  "caption": "Keterangan opsional"
}
```

`alt` menjelaskan isi atau fungsi gambar. Jangan mengisinya dengan nama file atau kata “gambar” saja.

## Social preview

```text
assets/img/social/portfolio-preview.svg
assets/img/social/portfolio-preview.png
assets/img/social/profile-card.png
```

SVG adalah source desain. PNG 1200 × 630 adalah file yang dipublikasikan.

Setelah memperbarui preview:

1. ekspor PNG pada ukuran 1200 × 630;
2. pastikan ukuran metadata pada halaman sesuai;
3. periksa `og:image` dan `twitter:image` pada tiga halaman utama;
4. buka URL gambar publik setelah deployment;
5. gunakan alat refresh cache resmi platform bila preview lama masih muncul.

## Canonical dan hreflang

Setiap halaman utama harus memiliki canonical serta alternatif `id`, `en`, `ja`, `zh`, dan `x-default`. Metadata dasar harus tersedia sebelum JavaScript dijalankan agar crawler tidak bergantung pada runtime.

Jika menambah halaman detail proyek:

- canonical mengarah ke URL detail tersebut;
- metadata sosial memakai judul, ringkasan, dan gambar yang sesuai;
- URL ditambahkan ke `sitemap.xml`;
- alternate language tidak mengarah ke artikel yang sebenarnya belum tersedia.

## Redirect lama

Folder berikut hanya untuk kompatibilitas URL:

```text
id/
en/
jp/
cn/
```

Jangan menambahkan halaman utama baru di dalamnya. Jika redirect diubah, pastikan query parameter lain dan hash URL tetap dipertahankan.

## Checklist

- [ ] Key dan tipe katalog UI konsisten pada empat bahasa.
- [ ] Teks fallback Indonesia tetap terlihat.
- [ ] Link navigasi mempertahankan bahasa aktif.
- [ ] CV dapat dibuka dari setiap bahasa.
- [ ] Alt text menjelaskan isi gambar.
- [ ] Preview sosial berukuran 1200 × 630.
- [ ] Canonical, hreflang, Open Graph, dan Twitter metadata benar.
- [ ] Sitemap valid sebagai XML.
- [ ] Redirect lama masih mempertahankan bahasa dan hash.
- [ ] `npm run verify` lulus.
