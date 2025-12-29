# Menjalankan Portfolio & Blog di Komputer Baru

## Prasyarat
- Git
- Node.js (termasuk npm)

## Clone repo
```bash
git clone https://github.com/sulujulianto/sulujulianto.github.io.git
cd sulujulianto.github.io
```

## Install pnpm
Pilihan A (rekomendasi, via corepack):
```bash
corepack enable
corepack prepare pnpm@9.14.4 --activate
```
Jika perlu sudo (misalnya symlink ditolak):
```bash
sudo corepack enable
```

Pilihan B (cara paling sederhana):
```bash
sudo npm i -g pnpm
```

## Jalankan blog (dev, live reload)
```bash
cd blog-fuwari
pnpm dev
```
Lalu buka `http://localhost:4321/blog/` (atau sesuai output terminal).

## Build blog ke /blog
```bash
cd blog-fuwari
pnpm build
```

## Preview hasil /blog (static)
Dari root repo:
```bash
npx serve blog
```
Atau:
```bash
cd blog
python3 -m http.server 8080
```

## Publish ke GitHub
```bash
git add .
git commit -m "Update blog"
git push
```

## Troubleshooting singkat
- pnpm not found: jalankan `corepack enable` lalu `corepack prepare pnpm@9.14.4 --activate`.
- Permission error saat corepack: gunakan `sudo corepack enable` atau pilih opsi npm global.
- Error TS: "File astro/tsconfigs/strict not found": jalankan `pnpm install` lalu restart TypeScript Server di VSCode.
- Favicon tidak berubah: browser sering cache agresif. Coba hard refresh atau ganti nama file.
