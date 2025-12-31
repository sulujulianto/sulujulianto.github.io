# Menjalankan Portfolio dan Blog di Komputer Baru

Panduan ini menjelaskan setup dari nol untuk **portfolio (root)** dan **blog (Astro/Fuwari)**.

## 1) Prasyarat
- Git
- Node.js LTS (disarankan Node 20 atau 22)
- npm

Cek versi:
```bash
node -v
npm -v
```

## 2) Clone repo
```bash
git clone https://github.com/sulujulianto/sulujulianto.github.io.git
cd sulujulianto.github.io
```

## 3) Setup Portfolio (root)
### Install dependency
```bash
npm install
```

### Preview portfolio secara lokal
```bash
npx serve .
```
Atau:
```bash
python3 -m http.server 8080
```
Buka URL yang muncul di terminal.

### Editing CSS (Tailwind)
- Saat editing:
```bash
npm run tailwind:watch
```
- Sebelum commit:
```bash
npm run tailwind:build
```
Output: `assets/css/output.css`

### Build TypeScript (portfolio)
```bash
npm run ts:build
```
Output: `assets/js/dist/`

### Yang wajib di-commit setelah perubahan portfolio
- `assets/css/output.css`
- `assets/js/dist/*`
- File HTML/JSON yang kamu edit

Catatan: jika hanya mengubah HTML biasa (tanpa Tailwind/TypeScript), biasanya tidak perlu menjalankan `tailwind:build` dan `ts:build`.

## 4) Setup Blog (Astro/Fuwari)
### Install pnpm
**Opsi A (rekomendasi, Corepack):**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```
Jika permission error:
```bash
sudo corepack enable
```

**Opsi B (alternatif, global):**
```bash
sudo npm i -g pnpm
```

### Install dependency blog
```bash
cd blog-fuwari
pnpm install
cd ..
```

### Jalankan blog (live reload)
```bash
npm run blog:dev
```
Buka URL dev server yang muncul di terminal (contoh: `http://localhost:4321/blog/`).

### Build blog ke `/blog`
```bash
npm run blog:build
```
Build ini **otomatis membersihkan** folder `/blog` agar tidak ada halaman lama yang tersisa.

### Yang wajib di-commit setelah perubahan blog
- Semua perubahan di `/blog-fuwari` (source).
- Hasil build di `/blog` (output statis untuk GitHub Pages).

### Cek kesehatan blog (doctor)
```bash
npm run blog:doctor
```

### Preview hasil `/blog` secara lokal
Opsi A (serve output langsung):
```bash
npx serve blog
```
Buka URL yang muncul di terminal (biasanya tanpa `/blog/`).

Opsi B (jalankan server dari root repo):
```bash
python3 -m http.server 8080
```
Buka `http://localhost:8080/blog/`.

Catatan: jika server dijalankan dari dalam folder `blog/`, maka aksesnya `http://localhost:PORT/` (tanpa `/blog/`).

## 5) Publish ke GitHub
```bash
git status
git add -A
git commit -m "Update portfolio/blog"
git push
```
Catatan: jika kamu menjalankan `npm run blog:build`, perubahan output di `/blog` memang harus ikut di-commit.

## Checklist sebelum push
- [ ] `npm run tailwind:build` jika ada perubahan CSS/kelas Tailwind.
- [ ] `npm run ts:build` jika ada perubahan TypeScript.
- [ ] `npm run blog:build` jika ada perubahan blog.
- [ ] Pastikan `/blog` sudah terupdate dan tidak ada error build.
- [ ] `git status` bersih sebelum push.

## Catatan penting
- Jangan edit `/blog` manual, karena itu output build.
- Semua perubahan blog harus dilakukan di `/blog-fuwari`.
