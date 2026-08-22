# Menyiapkan Blog di Komputer Baru

Panduan ini dijalankan setelah [setup portfolio root](../portfolio/SETUP-BARU.md). Portfolio dan blog berada dalam satu repository; jangan clone Fuwari sebagai repository kedua.

## 1. Masuk ke repository

```bash
cd sulujulianto.github.io
git status --short --branch
```

Pastikan branch adalah `main` dan working tree bersih.

## 2. Aktifkan Node.js repository

```bash
nvm install
nvm use
node --version
```

Gunakan versi dari `.nvmrc`.

## 3. Aktifkan pnpm yang dikunci proyek

```bash
corepack enable
cd blog-fuwari
pnpm --version
```

Versi yang diharapkan saat panduan ini ditulis adalah `9.14.4`, sesuai properti `packageManager` dalam `blog-fuwari/package.json`.

Jika `corepack` tidak tersedia, jangan memilih versi pnpm secara acak. Pasang versi yang tertulis pada properti `packageManager`, lalu ulangi `pnpm --version`.

## 4. Pasang dependency blog

Jalankan dari `blog-fuwari/`:

```bash
pnpm install --frozen-lockfile
```

Jangan menggunakan npm di folder ini. Script `preinstall` memang menolak package manager selain pnpm.

## 5. Bangun blog

```bash
pnpm build
```

Build akan:

1. membersihkan output `../blog/`;
2. membangun halaman Astro;
3. membuat indeks Pagefind;
4. memastikan `blog/.nojekyll` tersedia.

Build harus selesai sebelum tes output atau pemeriksaan browser dilakukan.

## 6. Periksa output utama

```bash
cd ..

test -f ../blog/.nojekyll
test -f ../blog/index.html
test -f ../blog/about/index.html
test -f ../blog/archive/index.html
test -f ../blog/rss.xml
test -f ../blog/sitemap-index.xml
test -f ../blog/_pagefind/pagefind.js
```

Tidak adanya output tersebut berarti build belum lengkap.

## 7. Jalankan pemeriksaan blog

```bash
pnpm doctor
pnpm check
```

`pnpm doctor` memeriksa konfigurasi dan aset dasar. `pnpm check` dapat menampilkan diagnostic baseline yang sudah dikenal; bandingkan hasilnya dengan branch `main` dan jangan menerima diagnostic baru.

## 8. Periksa melalui browser

Kembali ke root repository:

```bash
cd ..
python3 -m http.server 8080
```

Buka:

- <http://localhost:8080/blog/>
- <http://localhost:8080/blog/about/>
- <http://localhost:8080/blog/archive/>
- satu halaman artikel.

Periksa desktop dan mobile, navigasi, gambar, tema terang/gelap, pencarian, dan tautan.

## 9. Pastikan clone awal tetap konsisten

```bash
git diff --check
git status --short --branch
```

Setelah build pada clone bersih, output idealnya identik dengan output yang dikomit. Jika muncul diff, jangan langsung commit atau membuangnya. Periksa versi Node, pnpm, dependency, dan penyebab perbedaan terlebih dahulu.

Lanjutkan ke [panduan menulis postingan](MENULIS-POSTINGAN.md) atau [panduan memperbarui Fuwari](MEMPERBARUI-FUWARI.md).
