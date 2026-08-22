# Memperbarui Core Fuwari dengan Aman

Pembaruan Fuwari bukan penggantian seluruh folder. Source lokal memuat identitas, konten, aset, base path GitHub Pages, dan script build yang tidak boleh tertimpa tanpa peninjauan.

## 1. Tentukan ruang lingkup

Pisahkan pekerjaan berikut:

- sinkronisasi core Fuwari;
- pembaruan dependency;
- perubahan konten;
- perubahan konfigurasi deployment.

Jangan menggabungkan upgrade mayor Astro/Tailwind dengan sinkronisasi core kecuali kompatibilitasnya sudah dibuktikan secara terpisah.

## 2. Pastikan repository bersih

```bash
git switch main
git pull --ff-only origin main
git status --short --branch
```

Jika ada perubahan lokal, hentikan proses dan selesaikan atau simpan perubahan tersebut terlebih dahulu.

## 3. Siapkan remote resmi

```bash
EXPECTED_UPSTREAM_URL="https://github.com/saicaca/fuwari.git"

if git remote get-url fuwari-upstream >/dev/null 2>&1; then
  git remote get-url fuwari-upstream
else
  git remote add fuwari-upstream "$EXPECTED_UPSTREAM_URL"
fi

git fetch fuwari-upstream main
git rev-parse refs/remotes/fuwari-upstream/main
```

Pastikan URL remote tepat. Catat SHA upstream yang akan dipakai pada deskripsi Pull Request.

## 4. Buat branch sinkronisasi

```bash
git switch -c chore/sync-fuwari-core
```

Jangan bekerja langsung pada `main`.

## 5. Bandingkan source terkomit

Gunakan snapshot `git archive` agar `node_modules`, `.astro`, dan output sementara tidak mengotori hasil:

```bash
COMPARE_DIR="$(mktemp -d /tmp/fuwari-source-compare.XXXXXX)"

mkdir -p "$COMPARE_DIR/upstream" "$COMPARE_DIR/local"

git archive --format=tar refs/remotes/fuwari-upstream/main |
tar -xf - -C "$COMPARE_DIR/upstream"

git archive --format=tar HEAD:blog-fuwari |
tar -xf - -C "$COMPARE_DIR/local"

diff --brief --recursive   "$COMPARE_DIR/upstream"   "$COMPARE_DIR/local"
```

Jangan mengambil keputusan dari jumlah file saja. Kelompokkan perbedaan menjadi core upstream, konfigurasi deployment, identitas/aset, konten, dan script lokal.

## 6. Tentukan file yang dipertahankan

File berikut biasanya milik repository ini dan harus diperiksa sebelum diganti:

- `blog-fuwari/astro.config.mjs`;
- `blog-fuwari/src/config.ts`;
- `blog-fuwari/src/content/**`;
- `blog-fuwari/public/assets/**`;
- `blog-fuwari/public/favicon/**`;
- script build lokal dalam `blog-fuwari/scripts/`;
- script `prebuild`, `build`, `postbuild`, dan `doctor` pada `package.json`.

Daftar tersebut bukan alasan untuk mempertahankan workaround selamanya. File runtime dan stylesheet core harus dibandingkan dengan upstream berdasarkan bukti, bukan otomatis dipertahankan atau otomatis ditimpa.

## 7. Sinkronkan dalam kelompok kecil

Salin hanya file yang sudah ditinjau dari snapshot upstream. Setelah setiap kelompok:

```bash
git diff --check
git diff --stat
git diff -- blog-fuwari
```

Berhenti jika perubahan menyentuh identitas, konten, aset, base path `/blog/`, atau output `../blog` tanpa sengaja.

## 8. Validasi pada worktree terpisah

Buat patch dan worktree agar build gagal tidak menghapus output pada working tree utama:

```bash
VALIDATION_REPO="$(mktemp -d /tmp/fuwari-sync-validation.XXXXXX)"

git worktree add --detach "$VALIDATION_REPO" HEAD
git diff --binary -- blog-fuwari |
git -C "$VALIDATION_REPO" apply

cd "$VALIDATION_REPO/blog-fuwari"
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm doctor
pnpm check
```

Syarat minimum:

- build berhasil;
- output dasar terbentuk;
- tidak ada diagnostic baru dibanding `main`;
- utility dan komponen Fuwari tetap tersedia;
- base path tetap `/blog/`.

## 9. Periksa output secara visual

Dari root worktree validasi:

```bash
cd "$VALIDATION_REPO"
python3 -m http.server 4173
```

Periksa Home, About, Archive, artikel, desktop, mobile, tema, pencarian, gambar, dan tautan. Perbedaan hash aset atau UID Astro bukan otomatis regresi; bandingkan struktur dan tampilan.

## 10. Bangun output pada branch utama

Setelah validasi terpisah berhasil:

```bash
cd /path/ke/sulujulianto.github.io/blog-fuwari
pnpm install --frozen-lockfile
pnpm build
```

Jika build gagal dan `blog/` terhapus, ikuti [panduan troubleshooting](TROUBLESHOOTING.md). Jangan stage output yang tidak lengkap.

## 11. Tinjau, stage, dan dokumentasikan

```bash
cd ..
git diff --check
git diff --stat
git status --short --branch
```

Stage hanya source dan output yang sudah diperiksa. Cantumkan SHA upstream, file yang disinkronkan, hasil build, diagnostic baseline, dan hasil pemeriksaan visual pada Pull Request.

## 12. Bersihkan worktree validasi

Setelah pekerjaan selesai dan path sudah dipastikan benar:

```bash
git worktree remove "$VALIDATION_REPO"
git worktree prune
```

Lanjutkan dengan [Checklist Publikasi Blog](CHECKLIST-PUBLIKASI.md).
