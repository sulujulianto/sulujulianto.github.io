# sulujulianto.github.io

Repo ini berisi dua bagian utama:
- Portfolio statis di root repository.
- Blog statis di `/blog` yang dibangun dari source `/blog-fuwari` (Astro + Fuwari).

## Struktur folder
- `/` : portfolio (jangan ubah struktur/format tanpa kebutuhan)
- `/blog` : output build blog (jangan edit manual)
- `/blog-fuwari` : source blog (Astro + Fuwari)
- `/docs` : dokumentasi dan panduan perawatan

## Aturan penting
- **Jangan edit `/blog` manual.** Semua perubahan blog dilakukan di `/blog-fuwari` lalu dibuild.

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

### Develop portfolio (Tailwind + TypeScript)
```bash
npm install
npm run tailwind:watch
npm run ts:build
```
Catatan: jalankan `tailwind:watch` saat editing dan ulangi `ts:build` jika ada perubahan TypeScript; build Tailwind/TS hanya diperlukan bila ada perubahan Tailwind/TypeScript.

### Build portfolio final (sebelum commit)
```bash
npm run tailwind:build
npm run ts:build
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
- Troubleshooting: `docs/TROUBLESHOOTING.md`

## Link live
- Portfolio: https://sulujulianto.github.io/
- Blog: https://sulujulianto.github.io/blog/
