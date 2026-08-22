# Dokumentasi Blog

Panduan di folder ini khusus untuk source `blog-fuwari/` dan output `blog/`.

## Kenali dua folder blog

| Folder | Fungsi | Boleh diedit langsung? |
| --- | --- | --- |
| `blog-fuwari/` | Source Astro/Fuwari, konfigurasi, konten, dan aset | Ya |
| `blog/` | Output statis yang dipublikasikan GitHub Pages | Tidak; hasilkan dengan build |

Portfolio root mempunyai dependency npm sendiri. Blog menggunakan pnpm dan lockfile di `blog-fuwari/`.

## Pilih panduan

| Kebutuhan | Panduan |
| --- | --- |
| Menyiapkan blog pada komputer baru | [SETUP-BARU.md](SETUP-BARU.md) |
| Menulis atau memperbarui postingan | [MENULIS-POSTINGAN.md](MENULIS-POSTINGAN.md) |
| Menyelaraskan core dengan upstream Fuwari | [MEMPERBARUI-FUWARI.md](MEMPERBARUI-FUWARI.md) |
| Memeriksa perubahan sebelum publikasi | [CHECKLIST-PUBLIKASI.md](CHECKLIST-PUBLIKASI.md) |
| Menangani build, style, path, atau output bermasalah | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

## Urutan umum perubahan blog

1. Pastikan root repository bersih.
2. Buat branch khusus blog.
3. Ubah source di `blog-fuwari/`.
4. Pasang dependency dengan lockfile.
5. Jalankan build.
6. Periksa output dasar dan tampilan browser.
7. Tinjau perubahan source dan `blog/`.
8. Stage hanya file yang sudah diperiksa.
9. Commit, push, buat Pull Request, lalu tunggu CI.
10. Setelah merge, periksa URL `/blog/` pada GitHub Pages.

Kembali ke [Pusat Dokumentasi Repository](../README.md).
