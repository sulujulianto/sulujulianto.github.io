# Memperbarui Fuwari dan Dependency Blog

Fuwari disimpan sebagai source yang telah dikustomisasi dalam `blog-fuwari/`, bukan sebagai Git submodule. Pembaruan upstream tidak boleh dilakukan dengan mengganti folder secara langsung tanpa meninjau diff.

## Kapan perlu diperbarui

Lakukan pemeriksaan ketika:

- Dependabot membuat Pull Request;
- `pnpm audit` melaporkan kerentanan;
- Astro, Svelte, atau Node.js yang digunakan mendekati akhir dukungan;
- ada perbaikan upstream yang benar-benar dibutuhkan;
- build mulai menghasilkan deprecation warning.

Tidak semua versi terbaru harus langsung dipasang. Patch keamanan dan perbaikan bug diprioritaskan. Upgrade mayor direncanakan sendiri karena dapat mengubah konfigurasi, API, dan hasil build.

## File yang wajib dipertahankan

- `blog-fuwari/astro.config.mjs`
- `blog-fuwari/package.json`
- `blog-fuwari/pnpm-lock.yaml`
- `blog-fuwari/src/config.ts`
- `blog-fuwari/src/content.config.ts`
- `blog-fuwari/src/content/**`
- `blog-fuwari/src/pages/**`
- `blog-fuwari/src/layouts/**`
- `blog-fuwari/src/components/**`
- `blog-fuwari/scripts/**`
- `blog-fuwari/tests/**`
- `blog-fuwari/public/assets/images/**`
- `blog-fuwari/public/favicon/**`
- `.github/workflows/blog-ci.yml`
- `.github/dependabot.yml`
- `docs/MENGELOLA-BLOG.md`
- `docs/WRITE-POSTS.md`

Daftar tersebut bukan alasan untuk selalu mempertahankan kode lama. Jika upstream memperbaiki bagian yang sama, gabungkan perubahan dengan sengaja dan uji kembali perilakunya.

## Memperbarui dependency patch atau minor

1. Buat branch khusus dari `main` terbaru.
2. Aktifkan Node.js dan pnpm proyek.
3. Dari `blog-fuwari/`, periksa versi:

   ```bash
   pnpm outdated
   pnpm audit
   ```

4. Perbarui satu kelompok yang berkaitan. Jangan mencampur upgrade mayor dengan perubahan artikel.
5. Perbarui lockfile menggunakan pnpm 11.21.0.
6. Jalankan:

   ```bash
   pnpm install
   pnpm format:check
   pnpm lint
   pnpm verify
   pnpm audit --prod
   ```

7. Tinjau `package.json`, `pnpm-lock.yaml`, source, dan seluruh perubahan `../blog/`.

## Memperbarui template upstream

1. Catat versi atau commit Fuwari yang menjadi sumber pembaruan.
2. Unduh upstream ke direktori sementara di luar repository.
3. Bandingkan dengan:

   ```bash
   diff -qr /tmp/fuwari-upstream blog-fuwari
   ```

4. Pindahkan perubahan per bagian, bukan dengan menghapus seluruh `blog-fuwari/`.
5. Dahulukan konfigurasi build, lalu komponen, kemudian styling.
6. Pertahankan base `/blog/`, output `../blog`, metadata, RSS, robots, Pagefind, script aman, dan pengujian lokal.
7. Jalankan seluruh verifikasi setelah setiap kelompok perubahan.

## Pemeriksaan Pull Request

- Blog CI lulus.
- `pnpm audit --prod` tidak melaporkan kerentanan yang diketahui. Jika paket
  transitif belum merilis perbaikan pada rentang dependency yang dipakai,
  override hanya boleh ditambahkan dengan versi aman yang sudah diuji dan
  harus tetap dikunci oleh lockfile.
- `pnpm verify:committed-output` lulus setelah build. Pemeriksaan ini
  menormalisasi UID internal Astro, tetapi tetap membandingkan HTML lainnya,
  aset stabil, daftar file, dan kelengkapan indeks Pagefind.
- Tidak ada file portfolio yang ikut berubah.
- Halaman utama, artikel, arsip, pencarian, RSS, dan sitemap diperiksa.
- Perubahan mayor mempunyai penjelasan migrasi dan cara rollback.

Jangan menggabungkan pembaruan hanya karena nomor versinya lebih tinggi. Nilai pembaruan ditentukan oleh dukungan, keamanan, kompatibilitas, dan manfaat yang dapat dibuktikan.
