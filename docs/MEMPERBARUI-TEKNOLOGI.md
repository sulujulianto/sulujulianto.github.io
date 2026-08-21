# Memeriksa dan Memperbarui Teknologi

Panduan ini membantu menentukan apakah dependency perlu diperbarui. Tujuannya bukan mengejar setiap versi terbaru, melainkan menjaga keamanan, kompatibilitas, dan kemudahan pemeliharaan.

Terakhir ditinjau: **21 Agustus 2026**.

## Sumber versi yang benar

| Kebutuhan | File |
| --- | --- |
| Versi Node.js | `.nvmrc` dan `engines.node` dalam `package.json` |
| Dependency langsung | `package.json` |
| Versi dependency yang benar-benar terpasang | `package-lock.json` |
| Runtime CI | `.github/workflows/portfolio-ci.yml` |
| Build CSS | `tailwind.config.js`, `postcss.config.js`, dan script npm |
| Build TypeScript | `tsconfig.json` dan `tsconfig.runtime.json` |

README adalah ringkasan, bukan sumber versi utama. Jika README berbeda dari file konfigurasi, perbaiki README setelah memastikan konfigurasi yang benar.

## Kondisi toolchain saat peninjauan terakhir

| Teknologi | Keputusan saat ini |
| --- | --- |
| Node.js 24 | LTS yang digunakan untuk lokal dan CI. |
| React 18.3.1 | Dipertahankan karena portfolio masih memakai distribusi UMD melalui CDN. |
| Tailwind CSS 3.4.19 | Dipertahankan karena migrasi v4 mengubah CLI, konfigurasi, dan perilaku CSS. |
| TypeScript 5.9.3 | Dipertahankan sementara; migrasi berikutnya harus memperbaiki opsi konfigurasi lama terlebih dahulu. |
| PostCSS dan Autoprefixer | Diperbarui melalui pembaruan kompatibel dan diverifikasi dengan build CSS. |
| Playwright | Diperbarui terpisah bila browser atau pengujian memerlukannya. |
| GitHub Actions | Menggunakan `actions/checkout@v6` dan `actions/setup-node@v6`. |

Keputusan ini dapat berubah setelah advisory keamanan, penghentian dukungan, atau kebutuhan fitur baru. Jangan menyalin tabel ini sebagai alasan permanen untuk menolak pembaruan.

## Pemeriksaan awal

Mulai dari branch baru:

```bash
git switch main
git pull --ff-only origin main
git switch -c chore/maintenance-YYYY-MM
nvm install 24
nvm use
npm ci
```

Kemudian jalankan:

```bash
node --version
npm --version
npm audit
npm outdated
npm run verify
```

`npm outdated` biasanya keluar dengan status nonzero ketika menemukan versi baru. Itu bukan kegagalan build.

## Menentukan prioritas

Urutan prioritas:

1. advisory keamanan yang relevan dengan cara portfolio menggunakan paket;
2. versi Node atau GitHub Actions yang mendekati akhir dukungan;
3. bug yang benar-benar memengaruhi build atau halaman publik;
4. pembaruan patch dan minor yang kompatibel;
5. migrasi mayor yang memberikan manfaat nyata.

Versi terbaru tidak otomatis lebih aman untuk project jika migrasinya merusak build, mengubah tampilan, atau membuat dependency lain tidak kompatibel.

## Membaca jenis pembaruan

- **Patch** biasanya memperbaiki bug atau keamanan tanpa mengubah API.
- **Minor** dapat menambah fitur dan tetap kompatibel, tetapi masih perlu pengujian.
- **Major** dapat menghapus API, mengubah konfigurasi, atau mengubah hasil build.

Periksa changelog dan migration guide resmi sebelum memperbarui major. Jangan menggabungkan React, Tailwind, dan TypeScript major dalam satu Pull Request.

## Pembaruan patch atau minor

Perbarui satu kelompok paket yang saling berkaitan, lalu tinjau lockfile:

```bash
npm install --save-dev nama-paket@versi
git diff -- package.json package-lock.json
npm audit
npm run verify
```

Jika paket dipakai pada halaman melalui CDN, versi URL CDN dan dependency lokal harus tetap sama.

## Migrasi React

React 19 tidak menyediakan build UMD yang saat ini digunakan portfolio. Migrasinya memerlukan keputusan arsitektur, misalnya berpindah ke ESM CDN atau bundler.

Lakukan pada branch khusus dan periksa:

- cara memuat React dan ReactDOM pada seluruh halaman;
- tipe React dan ReactDOM;
- pemanggilan `createRoot`;
- hasil build TypeScript;
- fixture pengujian browser yang memalsukan URL CDN;
- perilaku loading, hydration, dan error handling.

Jangan hanya mengubah nomor versi pada `package.json`.

## Migrasi Tailwind CSS

Tailwind v4 mengubah CLI, plugin PostCSS, konfigurasi, directive CSS, dan beberapa default visual. Migrasi harus dilakukan terpisah dengan screenshot atau pemeriksaan visual sebelum dan sesudah.

Periksa khusus:

- border dan ring;
- shadow, radius, dan blur;
- Preflight untuk tombol, input, dialog, dan placeholder;
- utility kustom;
- dark mode;
- tampilan mobile dan desktop;
- ukuran `assets/css/output.css`.

## Migrasi TypeScript

TypeScript 7 tidak lagi menerima beberapa opsi lama. `tsconfig.runtime.json` saat ini masih menggunakan `moduleResolution: "node"`, sehingga perubahan major memerlukan migrasi konfigurasi.

Urutan yang lebih mudah ditinjau:

1. uji TypeScript 6 dalam branch khusus;
2. perbaiki warning dan opsi deprecated;
3. bandingkan isi `assets/js/dist/`;
4. jalankan seluruh tes;
5. lanjutkan ke TypeScript 7 setelah konfigurasi kompatibel.

## Menangani `npm audit`

Jangan langsung menjalankan `npm audit fix` tanpa membaca perubahan yang ditawarkan. Periksa terlebih dahulu:

```bash
npm audit
npm audit --omit=dev
npm ls nama-paket
```

Pertanyaan yang harus dijawab:

- apakah paket dipakai saat runtime atau hanya saat build;
- apakah jalur kode yang rentan digunakan;
- apakah perbaikannya patch/minor atau memaksa major;
- apakah lockfile berubah lebih luas daripada yang diperlukan.

Kerentanan runtime produksi mendapat prioritas tertinggi. Kerentanan build-time tetap perlu ditangani, tetapi risikonya dinilai berdasarkan penggunaannya.

## Kapan pembaruan harus dipercepat?

Lakukan pembaruan lebih cepat jika:

- advisory resmi menyebut versi yang digunakan;
- `npm audit` menemukan kerentanan yang relevan;
- Node.js atau action memasuki EOL;
- CI tidak lagi berjalan pada runtime yang didukung;
- CDN berhenti menyediakan aset yang digunakan;
- browser target tidak lagi kompatibel;
- bug mengganggu aksesibilitas, keamanan, atau fungsi utama.

## Catatan keputusan

Untuk migrasi major, tulis bagian berikut pada Pull Request:

```md
## Alasan

- masalah atau kebutuhan yang mendorong pembaruan

## Risiko

- perubahan konfigurasi atau perilaku yang mungkin terjadi

## Verifikasi

- perintah otomatis yang dijalankan
- halaman dan ukuran layar yang diperiksa

## Batasan

- hal yang sengaja belum dimigrasikan
```

Catatan ini membantu memahami keputusan ketika repository baru dibuka kembali beberapa bulan kemudian.
