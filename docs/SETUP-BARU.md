# Menyiapkan Portfolio di Komputer Baru

Panduan ini menyiapkan portfolio root dan blog Fuwari dari awal.

## 1. Prasyarat

Gunakan:

- Git;
- Node.js 24 LTS;
- npm yang disertakan bersama Node.js;
- Corepack untuk pnpm blog.

Cek versi:

```bash
git --version
node --version
npm --version
```

## 2. Clone repository

```bash
git clone https://github.com/sulujulianto/sulujulianto.github.io.git
cd sulujulianto.github.io
```

Pastikan branch dan status benar:

```bash
git status --short --branch
git log -1 --oneline
```

## 3. Pasang dependency portfolio

```bash
npm ci
```

`npm ci` membaca `package-lock.json` dan memasang versi yang sama dengan CI.

## 4. Verifikasi portfolio

```bash
npm run verify
```

Hasil yang benar:

- build Tailwind selesai;
- audit selesai dengan 0 failure;
- seluruh tes lulus;
- hanya tiga warning gambar proyek yang sudah dikenal yang boleh muncul.

## 5. Jalankan portfolio lokal

```bash
python3 -m http.server 8080
```

Buka <http://localhost:8080/>. Hentikan server dengan `Ctrl+C`.

Jangan membuka `index.html` melalui `file://`, karena browser dapat memblokir pengambilan data JSON.

## 6. Siapkan pnpm untuk blog

Repository blog dikunci pada pnpm 9.14.4.

```bash
corepack enable
corepack prepare pnpm@9.14.4 --activate
```

Pasang dependency blog:

```bash
cd blog-fuwari
pnpm install --frozen-lockfile
cd ..
```

Jalankan pemeriksaan:

```bash
npm run blog:doctor
```

## 7. Menjalankan blog

Mode pengembangan:

```bash
npm run blog:dev
```

Build final ke folder `blog/`:

```bash
npm run blog:build
```

Folder `blog-fuwari/` adalah source. Folder `blog/` adalah hasil build dan tidak boleh diedit manual.

## 8. Sebelum mulai mengubah repository

Buat branch baru:

```bash
git switch main
git pull --ff-only origin main
git switch -c nama-branch-baru
```

Lanjutkan dengan [ALUR-PENGEMBANGAN.md](ALUR-PENGEMBANGAN.md) atau pilih pekerjaan dari [README dokumentasi](README.md).

## File hasil build yang harus ikut di-commit

| Perubahan source | Hasil build |
| --- | --- |
| CSS atau class Tailwind | `assets/css/output.css` |
| TypeScript portfolio | `assets/js/dist/*.js` |
| Source blog | isi folder `blog/` |

JSON dan HTML tidak memiliki hasil build sendiri, tetapi seluruh perubahan tetap harus melewati `npm run verify`.
