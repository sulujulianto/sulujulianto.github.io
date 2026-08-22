# Checklist Publikasi Blog

Ikuti urutan ini sebelum commit atau merge perubahan blog.

## 1. Source

- [ ] Perubahan dilakukan di `blog-fuwari/`, bukan langsung di `blog/`.
- [ ] Identitas, konten, aset, dan konfigurasi deployment yang tidak berkaitan tetap utuh.
- [ ] Tidak ada rahasia, token, data pribadi sensitif, atau file sementara.
- [ ] `git diff --check` tidak melaporkan masalah.

## 2. Dependency dan build

Dari `blog-fuwari/`:

```bash
corepack enable
pnpm --version
pnpm install --frozen-lockfile
pnpm build
pnpm doctor
pnpm check
```

- [ ] Versi pnpm sesuai `packageManager`.
- [ ] Instalasi frozen lockfile berhasil.
- [ ] Build dan Pagefind berhasil.
- [ ] Doctor tidak melaporkan kegagalan.
- [ ] Astro Check tidak menambah diagnostic baru dibanding `main`.

## 3. Output dasar

```bash
test -f ../blog/.nojekyll
test -f ../blog/index.html
test -f ../blog/about/index.html
test -f ../blog/archive/index.html
test -f ../blog/rss.xml
test -f ../blog/sitemap-index.xml
test -f ../blog/_pagefind/pagefind.js
```

- [ ] Seluruh perintah selesai dengan exit code 0.
- [ ] Referensi halaman dan aset menggunakan base path `/blog/`.
- [ ] CSS tidak menyisakan directive Tailwind mentah.

## 4. Pemeriksaan browser

Dari root repository:

```bash
python3 -m http.server 8080
```

Periksa:

- [ ] Home;
- [ ] About;
- [ ] Archive;
- [ ] minimal satu artikel;
- [ ] navigasi dan pencarian;
- [ ] tema terang dan gelap;
- [ ] gambar dan tautan;
- [ ] desktop dan mobile.

## 5. Diff dan staging

```bash
git diff --check
git diff --stat
git status --short --branch
```

- [ ] Hanya source blog dan output build yang diharapkan berubah.
- [ ] Portfolio tidak berubah tanpa rencana.
- [ ] Output `blog/` berasal dari build yang berhasil.
- [ ] File distage dengan path eksplisit.
- [ ] `git diff --cached --check` lulus.
- [ ] `git diff --cached --stat` sudah ditinjau.

## 6. Pull Request

- [ ] Commit mempunyai pesan yang menjelaskan tujuan.
- [ ] Branch sudah dipush.
- [ ] Deskripsi PR memuat validasi build dan visual.
- [ ] Jika menyinkronkan Fuwari, SHA upstream dicantumkan.
- [ ] Semua check GitHub berhasil.
- [ ] Head SHA diperiksa kembali sebelum merge.

## 7. Setelah merge

- [ ] `main` lokal diperbarui dengan fast-forward.
- [ ] GitHub Pages selesai melakukan deployment.
- [ ] <https://sulujulianto.github.io/blog/> dapat diakses.
- [ ] Halaman dan aset utama diperiksa kembali pada URL produksi.
- [ ] Branch pekerjaan dibersihkan setelah deployment terbukti sehat.
