# sulujulianto.github.io

Repo ini berisi dua bagian utama:
- Portfolio statis di root repository.
- Blog statis di `/blog` yang dibangun dari source `/blog-fuwari` (Astro + Fuwari).

## Struktur folder
- `/index.html` : halaman utama portfolio multibahasa
- `/projects.html` : arsip proyek multibahasa
- `/projects/<slug>/index.html` : shell halaman studi kasus untuk proyek yang sudah dipublikasikan
- `/certificates.html` : arsip sertifikat multibahasa
- `/id`, `/en`, `/jp`, `/cn` : redirect kompatibilitas untuk URL lama
- `/assets/data/locales` : katalog teks antarmuka per bahasa
- `/assets/data/skills/skills.json` : kelompok, urutan, status, dan referensi ikon Skills
- `/assets/data/categories/projects` : katalog kategori proyek dengan ID yang sama untuk semua bahasa
- `/assets/data/project-details/<lang>/<slug>.json` : isi studi kasus proyek berbentuk blok artikel
- `/assets/img/project-details/<slug>` : gambar sisipan untuk studi kasus proyek
- `/assets/icons/skills.svg` : sprite SVG lokal untuk seluruh ikon Skills
- `/assets/data/history/experience` : data pengalaman per bahasa
- `/assets/data/history/education-and-training` : data pendidikan dan pelatihan per bahasa
- `/blog` : output build blog (jangan edit manual)
- `/blog-fuwari` : source blog (Astro + Fuwari)
- `/docs` : dokumentasi dan panduan perawatan

## Aturan penting
- **Jangan edit `/blog` manual.** Semua perubahan blog dilakukan di `/blog-fuwari` lalu dibuild.
- Kartu proyek selalu membuka `/projects/<slug>/`. Slug tanpa `index.html` akan menggunakan halaman 404 GitHub Pages.
- Isi studi kasus ditulis sebagai blok JSON yang aman: `paragraph`, `heading`, `list`, `image`, `code`, atau `callout`.
- Tombol GitHub dan Live Demo dirender hanya jika URL terkait berisi nilai. Gunakan `null` untuk tautan yang belum tersedia.

## Menulis studi kasus proyek

Setiap proyek yang selesai membutuhkan tiga bagian yang saling cocok:

1. `slug` dan `status: "published"` pada katalog `assets/data/projects/projects-<lang>.json`.
2. Shell nyata di `projects/<slug>/index.html`.
3. Artikel di `assets/data/project-details/<lang>/<slug>.json`.

Proyek yang masih dikerjakan tetap memiliki `slug`, tetapi memakai
`status: "in-development"` dan tidak memiliki shell maupun artikel. Kartu akan
menampilkan label status dan URL-nya sengaja berakhir pada halaman 404.

Contoh blok gambar di tengah artikel:

```json
{
  "type": "image",
  "src": "/assets/img/project-details/contoh/screenshot.webp",
  "alt": "Deskripsi visual yang jelas",
  "caption": "Keterangan gambar untuk pembaca."
}
```

## Memakai kategori proyek

Kategori proyek didefinisikan di empat katalog
`assets/data/categories/projects/project-categories-<lang>.json`. Semua katalog
harus memakai ID dan urutan yang sama; hanya `label` yang diterjemahkan.

Kategori yang belum dipakai tidak ditampilkan sebagai tombol filter. Kategori
akan muncul otomatis pada bahasa terkait setelah ID-nya dipasang pada properti
`category` sebuah proyek yang memiliki judul. Contoh:

```json
{
  "title": "Contoh Proyek",
  "category": "frontend-web"
}
```

ID siap pakai: `frontend-web`, `fullstack-web`, `backend-api`, `mobile-app`,
`desktop-app`, `ai-machine-learning`, `data-database`, `cloud-infrastructure`,
`devops-automation`, `cybersecurity`, `systems-networking`,
`cli-developer-tools`, dan `game-interactive`. ID `*` dicadangkan untuk tombol
"Semua" dan tidak boleh dipakai pada data proyek.

## Quick start (copy-paste)

### Lihat portfolio secara lokal (static server)
```bash
npx serve .
```
Atau:
```bash
python3 -m http.server 8080
```
Buka URL yang muncul di terminal.

Bahasa portfolio dipilih melalui `?lang=id|en|ja|zh`, lalu disimpan di
`localStorage` dengan kunci `portfolio.lang`. Jika parameter dan pilihan
tersimpan tidak tersedia, situs menggunakan bahasa browser dan kembali ke
Bahasa Indonesia sebagai fallback.

### Develop portfolio (Tailwind + TypeScript)
```bash
npm install
npm run tailwind:watch
npm run ts:build
```
Catatan: jalankan `tailwind:watch` saat editing dan ulangi `ts:build` jika ada perubahan TypeScript; build Tailwind/TS hanya diperlukan bila ada perubahan Tailwind/TypeScript.

### Build portfolio final (sebelum commit)
```bash
npm run verify
```

### Develop blog (live reload)
```bash
npm run blog:dev
```
Buka URL dev server yang ditampilkan di terminal (contoh: `http://localhost:4321/blog/`).

### Build blog ke `/blog`
```bash
npm run blog:build
```

### Cek kesehatan blog
```bash
npm run blog:doctor
```

## Kapan commit apa
- **Edit CSS/Tailwind portfolio**: commit `assets/css/output.css`.
- **Edit TypeScript portfolio**: commit hasil build `assets/js/dist/*`.
- **Edit blog**: commit perubahan di `/blog-fuwari` dan hasil build di `/blog`.

## Dokumentasi
- Setup baru: `docs/SETUP-BARU.md`
- Menulis post: `docs/WRITE-POSTS.md`
- Update Fuwari: `docs/UPDATE-FUWARI.md`
- Update galeri dan riwayat: `docs/UPDATE-ABOUT-HISTORY.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`

## Link live
- Portfolio: https://sulujulianto.github.io/
- Blog: https://sulujulianto.github.io/blog/
