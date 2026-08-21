# Checklist Sebelum Publikasi

Gunakan dokumen ini setelah perubahan selesai. Checklist ini berlaku untuk portfolio root; blog memiliki build dan pemeriksaan tersendiri.

## 1. Pastikan ruang lingkup perubahan

```bash
git status --short --branch
git diff --name-status
```

- Pastikan branch bukan `main`.
- Pastikan tidak ada file pribadi atau file sementara.
- Pastikan `/blog` dan `/blog-fuwari` tidak ikut berubah jika pekerjaan hanya untuk portfolio.
- Pastikan file hasil build berubah hanya ketika source terkait memang diubah.

## 2. Tinjau data dan baseline

Jika proyek, sertifikat, atau kategori berubah:

```bash
git diff -- assets/data assets/img
npm run audit:baseline:update
git diff -- tests/fixtures/portfolio-data-baseline.json
```

Jangan menerima baseline sebelum memahami setiap perubahan data.

## 3. Jalankan pemeriksaan otomatis

```bash
nvm use
npm ci
npm audit
npm run verify
git diff --check
```

Semua perintah harus lulus. Tiga warning gambar proyek lama boleh muncul; failure atau warning baru harus diperiksa.

## 4. Periksa hasil build

Jika tidak mengubah CSS atau TypeScript, pastikan build tidak menghasilkan diff yang tidak diharapkan:

```bash
git diff -- assets/css/output.css assets/js/dist
```

Jika source CSS atau TypeScript memang diubah, tinjau hasil build dan commit source beserta output yang sesuai.

## 5. Periksa di browser

Jalankan:

```bash
python3 -m http.server 8080
```

Minimal periksa:

- `/`;
- `/projects.html`;
- `/certificates.html`;
- satu detail proyek Indonesia;
- detail proyek English bila terdampak;
- satu URL yang tidak tersedia untuk `404.html`.

Pada halaman terkait, uji:

- desktop dan mobile;
- mode terang dan gelap;
- bahasa yang diubah;
- navigasi keyboard;
- gambar dan tautan;
- filter, dropdown, dan tombol;
- Console dan Network browser.

## 6. Stage file secara spesifik

Gunakan daftar path yang sudah diperiksa:

```bash
git add -- path/file-pertama path/file-kedua
git diff --cached --check
git diff --cached --stat
git diff --cached
```

Jangan menggunakan staging seluruh repository pada working tree yang belum ditinjau.

## 7. Commit dan push

```bash
git commit -m "jenis: ringkasan perubahan"
git status --short --branch
git push -u origin nama-branch
```

Jenis commit yang umum:

- `feat:` fitur atau konten baru;
- `fix:` perbaikan kesalahan;
- `docs:` dokumentasi;
- `chore:` pemeliharaan toolchain atau dependency;
- `perf:` perbaikan performa.

## 8. Pull Request

Pull Request harus menjelaskan:

- perubahan yang dilakukan;
- alasan perubahan;
- cara verifikasi;
- batasan atau hal yang sengaja tidak diubah.

Mulai sebagai draft jika masih memerlukan pemeriksaan. Sebelum merge:

- CI harus sukses;
- status harus dapat digabungkan;
- diff harus sesuai ruang lingkup;
- tidak ada komentar review yang belum diselesaikan.

## 9. Setelah merge

```bash
git switch main
git pull --ff-only origin main
git status --short --branch
git log -1 --oneline --decorate
```

Pastikan:

- CI `main` berhasil;
- GitHub Pages berhasil dideploy;
- situs publik menampilkan perubahan;
- hard refresh atau incognito tidak menunjukkan aset lama;
- branch perubahan dihapus setelah aman.

## Ringkasan siap publikasi

- [ ] Ruang lingkup dan daftar file benar.
- [ ] Data serta baseline ditinjau.
- [ ] Audit dependency bersih atau sudah dinilai.
- [ ] `npm run verify` lulus.
- [ ] `git diff --check` bersih.
- [ ] Browser desktop/mobile diperiksa.
- [ ] File staging diperiksa satu per satu.
- [ ] CI Pull Request lulus.
- [ ] CI `main` dan deployment lulus.
- [ ] Situs publik diperiksa.
