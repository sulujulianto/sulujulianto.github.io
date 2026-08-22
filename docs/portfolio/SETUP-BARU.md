# Menyiapkan Portfolio di Komputer Baru

Panduan ini khusus untuk portfolio pada root repository. Untuk blog, lanjutkan ke [panduan setup blog](../blog/SETUP-BARU.md) setelah bagian ini selesai.

## 1. Pasang prasyarat

Siapkan:

- Git;
- NVM;
- Node.js sesuai file `.nvmrc`;
- npm yang disertakan bersama Node.js;
- Python 3 untuk server lokal.

Periksa alat yang sudah tersedia:

```bash
git --version
command -v nvm
python3 --version
```

Jika salah satu perintah gagal, pasang alat tersebut terlebih dahulu sebelum melanjutkan.

## 2. Clone satu repository

Portfolio dan blog berada dalam repository yang sama. Anda tidak perlu mengunduh blog secara terpisah.

```bash
git clone https://github.com/sulujulianto/sulujulianto.github.io.git
cd sulujulianto.github.io
```

Pastikan clone berada pada branch `main` dan belum memiliki perubahan lokal:

```bash
git status --short --branch
git log -1 --oneline --decorate
```

Hasil status yang diharapkan adalah `## main...origin/main` tanpa daftar file di bawahnya.

## 3. Aktifkan versi Node.js repository

```bash
nvm install
nvm use
node --version
npm --version
```

File `.nvmrc` adalah sumber versi Node.js. Jangan mengganti versi proyek berdasarkan versi global yang kebetulan terpasang di laptop.

## 4. Pasang dependency portfolio

Jalankan dari root repository:

```bash
npm ci
```

Gunakan `npm ci`, bukan `npm install`, untuk instalasi awal. Perintah ini mengikuti `package-lock.json` sehingga hasilnya konsisten dengan CI.

## 5. Verifikasi portfolio

```bash
npm audit
npm run verify
git diff --check
git status --short --branch
```

Hasil yang diharapkan:

- audit tidak menemukan kerentanan yang diketahui;
- build Tailwind dan TypeScript berhasil;
- audit data dan seluruh pengujian lulus;
- working tree tetap bersih.

Tiga warning gambar proyek lama yang sudah dicatat boleh muncul. Warning baru harus diperiksa.

## 6. Jalankan portfolio secara lokal

```bash
python3 -m http.server 8080
```

Buka <http://localhost:8080/>. Hentikan server dengan `Ctrl+C`.

Jangan membuka `index.html` menggunakan `file://` karena browser dapat memblokir pembacaan JSON.

## 7. Lanjutkan setup blog

Jika laptop juga akan digunakan untuk menulis atau membangun blog, lanjutkan ke [Menyiapkan Blog di Komputer Baru](../blog/SETUP-BARU.md).

## 8. Buat branch sebelum bekerja

Setelah seluruh setup dan verifikasi selesai:

```bash
git switch main
git pull --ff-only origin main
git switch -c jenis/ringkasan-pekerjaan
```

Contoh branch:

- `feat/add-project-name`;
- `fix/certificate-copy`;
- `docs/update-maintenance-guide`;
- `chore/update-dependencies`.

Pilih panduan pekerjaan berikutnya dari [Dokumentasi Portfolio](README.md).
