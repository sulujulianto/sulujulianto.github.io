# Troubleshooting Blog

Mulai dari gejala yang terlihat. Jangan langsung mengganti dependency atau menghapus banyak file.

## 1. Catat kondisi awal

Dari root repository:

```bash
git branch --show-current
git status --short --branch
git diff --check
node --version
corepack --version
cd blog-fuwari
pnpm --version
```

Simpan pesan error lengkap dan perintah yang memicunya.

## 2. Build gagal setelah output dibersihkan

Script `prebuild` membersihkan `blog/`. Karena itu build yang gagal dapat membuat seluruh output tampak terhapus.

Jangan commit keadaan tersebut. Pulihkan output terkomit dari root repository:

```bash
cd ..
git restore --source=HEAD --worktree -- blog
git status --short --branch
```

Setelah output aman, diagnosis source pada worktree terpisah mengikuti [panduan pembaruan Fuwari](MEMPERBARUI-FUWARI.md).

## 3. pnpm tidak tersedia atau versinya salah

```bash
nvm use
corepack enable
cd blog-fuwari
pnpm --version
```

Bandingkan hasil dengan `packageManager` pada `blog-fuwari/package.json`. Jangan memperbarui lockfile hanya untuk menghilangkan pesan versi.

## 4. Build gagal pada CSS atau Tailwind

Periksa versi yang benar-benar terpasang:

```bash
pnpm list astro @astrojs/tailwind tailwindcss --depth 0
```

Kemudian cari directive Tailwind mentah pada output hanya setelah build berhasil:

```bash
rg -n '@tailwind|@apply' ../blog/_astro
```

Jika muncul error parser seperti token `&`, jangan langsung menambah adapter CSS. Bandingkan versi Astro, Tailwind, integrasi Tailwind, PostCSS, dan stylesheet dengan upstream yang kompatibel.

## 5. Tampilan kehilangan layout Fuwari

Pastikan output CSS memuat utility dasar:

```bash
for SELECTOR in   ".min-h-screen"   ".flex"   ".grid"   ".card-base"   ".link"
do
  rg --fixed-strings --quiet "$SELECTOR" ../blog/_astro/*.css &&
    echo "PASS: $SELECTOR" ||
    echo "FAIL: $SELECTOR"
done
```

Jika utility hilang, masalah berada pada pipeline CSS atau source stylesheet. Jangan memperbaikinya dengan mengedit CSS hasil build.

## 6. Base path atau aset menghasilkan 404

Periksa konfigurasi:

- `site` mengarah ke `https://sulujulianto.github.io/`;
- `base` adalah `/blog/`;
- output adalah `../blog`.

Periksa HTML:

```bash
rg -n 'href="/blog/|src="/blog/' ../blog/index.html
```

Path lokal blog harus diawali `/blog/`.

## 7. Pagefind atau .nojekyll hilang

Jalankan build lengkap, bukan hanya `astro build`:

```bash
pnpm build

test -f ../blog/.nojekyll
test -f ../blog/_pagefind/pagefind.js
```

Script build lengkap menjalankan Pagefind dan `postbuild`.

## 8. Astro Check gagal

```bash
pnpm check
```

Bandingkan diagnostic dengan `main`. Diagnostic lama bukan alasan mengabaikan diagnostic baru. Build berhasil juga tidak membuktikan semua tipe benar; keduanya adalah pemeriksaan berbeda.

## 9. Output berubah tanpa perubahan tampilan

Hash aset, UID Astro, dan whitespace HTML dapat berubah antarbuilt. Bandingkan:

1. daftar file;
2. referensi aset;
3. struktur HTML setelah nilai nondeterministik dinormalisasi;
4. aturan CSS;
5. tampilan browser.

Jangan menyimpulkan regresi atau keberhasilan hanya dari besar diff.

## 10. Kapan harus berhenti

Hentikan proses jika:

- working tree awal tidak bersih;
- SHA upstream berubah di tengah proses;
- build gagal;
- output dasar hilang;
- base path berubah;
- tampilan berbeda secara substantif;
- perubahan menyentuh portfolio tanpa direncanakan.

Pulihkan output jika perlu, simpan log, dan diagnosis satu penyebab pada satu waktu.
