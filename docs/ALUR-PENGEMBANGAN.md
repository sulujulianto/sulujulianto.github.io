# Alur Mengubah Tampilan dan Kode Portfolio

Panduan ini dipakai saat mengubah CSS, layout HTML, atau logika TypeScript.

## 1. Mulai dari `main` yang terbaru

```bash
git switch main
git pull --ff-only origin main
git switch -c nama-branch-baru
```

Contoh nama branch:

- `docs/update-maintenance-guide`
- `feat/add-new-project`
- `fix/mobile-navigation`

Jangan melakukan perubahan langsung di `main`.

## 2. Pasang dependency

```bash
npm ci
```

Gunakan `npm ci` ketika `package-lock.json` sudah tersedia. Perintah ini memasang versi dependency yang terkunci dan lebih mudah direproduksi daripada `npm install`.

## 3. Jalankan server lokal

```bash
python3 -m http.server 8080
```

Buka <http://localhost:8080/>. Server diperlukan karena portfolio mengambil file JSON dengan `fetch`.

## Mengedit CSS

Source CSS utama berada di:

```text
assets/css/main.css
```

Hasil build berada di:

```text
assets/css/output.css
```

Jangan mengedit `output.css` manual karena isinya akan ditimpa saat build.

Saat bekerja, buka terminal kedua:

```bash
npm run tailwind:watch
```

Kemudian edit `assets/css/main.css` atau class Tailwind di file HTML/TSX. Jika hanya ingin membangun sekali:

```bash
npm run tailwind:build
```

Setelah selesai, pastikan `assets/css/output.css` ikut berubah dan ikut di-commit.

## Mengedit HTML

Halaman utama yang aktif:

- `index.html`
- `projects.html`
- `certificates.html`
- `404.html`
- `projects/<slug>/index.html` untuk detail proyek yang sudah dipublikasikan

Folder `id/`, `en/`, `jp/`, dan `cn/` hanya redirect. Jangan menyalin konten baru ke sana.

Jika menambah class Tailwind baru di HTML, jalankan build Tailwind. Jika hanya mengubah teks biasa yang sudah tidak dikelola katalog bahasa, build CSS tidak diperlukan, tetapi `npm run verify` tetap wajib.

## Mengedit TypeScript atau JavaScript

Source runtime:

- `assets/js/app.tsx`: kartu proyek/sertifikat, riwayat, galeri, dan keahlian.
- `assets/js/project-detail.tsx`: artikel detail proyek.
- `assets/js/language-resolver.ts`: urutan pemilihan bahasa.
- `assets/js/locale-manager.ts`: penerapan teks, URL, metadata, CV, dan pemilih bahasa.
- `assets/js/theme.js`: tema, menu mobile, smooth scroll, dan tombol kembali ke atas.

File di `assets/js/dist/` adalah hasil kompilasi. Jangan edit manual.

Setelah mengubah `.ts` atau `.tsx`:

```bash
npm run ts:build
```

Commit source dan hasil build-nya bersama-sama.

## Mengedit JSON

JSON tidak memerlukan build. Pastikan:

- tanda kutip memakai `"`;
- tidak ada koma setelah item terakhir;
- tipe nilai tetap sama;
- semua path gambar benar;
- semua tanggal mengikuti format yang didokumentasikan.

Untuk data proyek, sertifikat, dan kategori, baca bagian baseline audit di [UPDATE-KONTEN-PORTFOLIO.md](UPDATE-KONTEN-PORTFOLIO.md#baseline-audit-data).

## Urutan pemeriksaan sebelum commit

```bash
npm run verify
git diff --check
git status --short --branch
git diff
```

`npm run verify` melakukan empat hal penting:

1. membangun CSS;
2. mengaudit data dan aset;
3. membangun TypeScript;
4. menjalankan seluruh tes.

Tiga warning gambar proyek yang sudah dikenal boleh muncul. Kegagalan atau warning baru harus diperiksa.

## Commit dan Pull Request

```bash
git add -A
git diff --cached --check
git diff --cached --stat
git commit -m "jenis: ringkasan perubahan"
git push -u origin nama-branch-baru
```

Contoh jenis commit:

- `docs:` dokumentasi;
- `feat:` fitur atau konten baru;
- `fix:` perbaikan bug;
- `chore:` pemeliharaan tanpa perubahan fitur.

Buat Pull Request menuju `main`, tunggu GitHub Actions lulus, tinjau file yang berubah, baru lakukan merge.

## Setelah merge

```bash
git switch main
git pull --ff-only origin main
```

Periksa situs publik. Branch fitur boleh dihapus setelah deployment terverifikasi.
