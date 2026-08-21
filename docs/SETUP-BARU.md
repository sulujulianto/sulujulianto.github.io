# Menyiapkan Portfolio di Komputer Baru

Panduan ini hanya menyiapkan portfolio root. Blog memiliki dependency dan alur build tersendiri.

## 1. Prasyarat

Pasang:

- Git;
- NVM;
- Node.js major 24;
- npm yang disertakan bersama Node.js;
- Python 3 untuk server lokal.

Periksa ketersediaannya:

```bash
git --version
command -v nvm
python3 --version
```

## 2. Clone repository

```bash
git clone https://github.com/sulujulianto/sulujulianto.github.io.git
cd sulujulianto.github.io
```

Pastikan repository berada pada `main` dan tidak memiliki perubahan lokal:

```bash
git status --short --branch
git log -1 --oneline --decorate
```

## 3. Aktifkan Node.js yang sesuai

File `.nvmrc` adalah sumber versi Node untuk pengembangan lokal dan CI.

```bash
nvm install
nvm use
node --version
npm --version
```

Versi Node harus berada pada major 24. Jangan mengubah alias default NVM hanya untuk repository ini karena perubahan tersebut dapat memengaruhi proyek lain.

## 4. Pasang dependency

```bash
npm ci
```

Gunakan `npm ci`, bukan `npm install`, ketika hanya ingin memasang dependency dari `package-lock.json`. Perintah ini menjaga instalasi lokal tetap sama dengan CI.

## 5. Verifikasi kondisi awal

```bash
npm audit
npm run verify
git status --short --branch
```

Hasil yang diharapkan:

- audit dependency tidak menemukan kerentanan;
- build Tailwind dan TypeScript selesai;
- audit data selesai tanpa failure;
- seluruh pengujian lulus;
- working tree tetap bersih.

Tiga warning gambar proyek yang sudah dikenal boleh muncul. Warning baru tidak boleh diabaikan.

## 6. Jalankan server lokal

```bash
python3 -m http.server 8080
```

Buka <http://localhost:8080/> dan hentikan server dengan `Ctrl+C` setelah selesai.

Jangan membuka `index.html` melalui `file://`. Portfolio mengambil JSON menggunakan `fetch`, dan browser dapat memblokir permintaan tersebut ketika halaman dibuka langsung dari filesystem.

## 7. Siapkan branch pekerjaan

```bash
git switch main
git pull --ff-only origin main
git switch -c jenis/ringkasan-pekerjaan
```

Contoh:

- `feat/add-project-name`;
- `fix/certificate-copy`;
- `docs/update-maintenance-guide`;
- `chore/update-dependencies`.

Selanjutnya pilih panduan yang sesuai dari [pusat dokumentasi](README.md).

## Jika juga akan mengubah blog

Jangan mencampurnya secara otomatis dengan pekerjaan portfolio. Baca [panduan menulis postingan](WRITE-POSTS.md) atau [panduan memperbarui Fuwari](UPDATE-FUWARI.md), lalu gunakan branch khusus blog.
