# Follow Up Pelanggan — cara memasang

Aplikasi ini menyambung ke spreadsheet **DO DHT 2013-JUL 2021**
(`14BioChiVzsyy8lYSHTi5yLzXoLwJhYGAajJVFwJd9aU`, tab gid `1480954882`).

Ada dua bagian: **backend** di Apps Script (yang membaca dan menulis spreadsheet)
dan **aplikasi** yang dipasang di HP atau laptop.

---

## Bagian 1 — Pasang backend (10 menit, sekali saja)

1. Buka [script.google.com](https://script.google.com) dengan akun yang memiliki spreadsheet itu.
2. **Proyek baru** → hapus isi `Code.gs` → tempel seluruh isi **API_Followup.gs**.
3. Simpan, lalu jalankan fungsi `ujiCepat` sekali untuk memberi izin akses spreadsheet.
   Kalau muncul peringatan "Google belum memverifikasi aplikasi ini", pilih
   **Lanjutan → Buka proyek (tidak aman)**. Ini proyek Bapak sendiri, jadi aman.
   Lihat hasilnya di menu **Log** — di situ terlihat nama sheet, jumlah baris, dan daftar kolom.
4. **Deploy → New deployment → jenis Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin URL yang berakhiran **`/exec`**.

> Setiap kali kode diubah, harus **Deploy → Manage deployments → Edit → New version**,
> supaya URL `/exec` yang lama tetap dipakai.

Script ini otomatis membuat tab baru bernama **FOLLOW UP** di spreadsheet yang sama.
Semua catatan, status, dan jadwal follow up tersimpan di situ — jadi data induknya tidak diutak-atik.
Satu-satunya yang ditulis balik ke tab utama adalah kolom nomor HP, kalau Bapak memperbaikinya lewat aplikasi.

---

## Bagian 2 — Pasang aplikasi

Semua berkas ini harus berada di satu folder: `index.html`, `manifest.webmanifest`,
`sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`.

### Cara tercepat — GitHub Pages (gratis, bisa diinstall)

1. Buat repository baru di GitHub, misalnya `followup-tomohon`, centang **Public**.
2. **Add file → Upload files** → seret semua berkas di atas → Commit.
3. **Settings → Pages** → Source: **Deploy from a branch**, branch `main`, folder `/ (root)` → Save.
4. Tunggu satu dua menit, alamatnya jadi `https://<nama-akun>.github.io/followup-tomohon/`.

### Install di HP Android (Poco F6)

Buka alamat itu di Chrome → menu titik tiga → **Tambahkan ke Layar utama** / **Instal aplikasi**.
Ikonnya muncul seperti aplikasi biasa dan bisa dibuka tanpa internet.

### Install di laptop

Buka alamat yang sama di Chrome atau Edge → ikon **Instal** di ujung kanan kolom alamat.

### Kalau tidak mau pakai GitHub

`index.html` tetap jalan kalau dibuka langsung dari berkas (klik dua kali).
Yang hilang hanya tombol install dan mode offline penuh — pengambilan data, WA, telepon,
AI Listening, dan simpan kontak tetap berfungsi.

---

## Bagian 3 — Pemakaian pertama

1. Buka aplikasi → tab **Pengaturan**.
2. Tempel URL `/exec` → **Hubungkan dan ambil data**.
   Aplikasi membaca daftar kolom, menebak sendiri kolom mana untuk nama, nomor HP, kota,
   tipe, salesman, dan tanggal, lalu menarik seluruh baris secara bertahap.
3. Periksa **Pemetaan kolom**. Kalau ada yang salah tebak, ganti lewat dropdown lalu
   **Simpan pemetaan dan muat ulang**.
4. Isi **Nama Anda** dan sesuaikan **Pesan pembuka WhatsApp**.
5. Buka tab **Pengingat** → **Nyalakan notifikasi**.

Setelah itu data tersimpan di perangkat, jadi aplikasi langsung terbuka
walaupun sedang tidak ada sinyal. Sinkron ulang lewat chip di pojok kanan atas.

---

## Catatan jujur soal dua fitur

**AI Listening.** Tidak ada aplikasi web yang bisa membaca isi chat WhatsApp —
WhatsApp terenkripsi dan tidak memberi izin akses ke browser. Yang bisa dan sudah dibuat:

- **Rekam percakapan** — mikrofon HP mendengarkan lalu menuliskan percakapan.
  Saat menelepon, nyalakan *speaker* supaya suara customer ikut tertangkap.
  Perlu Chrome di Android dan koneksi internet.
- **Tempel chat WhatsApp** — tekan lama pesan di WhatsApp → Salin → tempel di aplikasi.
  Atau pakai **Bagikan** di WhatsApp lalu pilih aplikasi ini; teksnya langsung masuk
  dan jendela analisa terbuka sendiri (hanya kalau aplikasi diinstall dari GitHub Pages).

Keduanya masuk ke mesin analisa yang sama dan menghasilkan tanda **LOW / HOT / PLAN SPK**
beserta alasannya. Plan SPK hanya diberikan kalau ada tanda komitmen nyata —
menyatakan mau ambil, menyebut DP, atau siap mengirim berkas.

**Cek nomor WhatsApp.** Tidak ada cara memverifikasi diam-diam dari browser.
Yang otomatis: nomor rumah, nomor kantor, tulisan `NA`, dan nomor yang bentuknya bukan
seluler Indonesia langsung ditandai **Bukan nomor WA** dan tombol chatnya dimatikan.
Untuk sisanya pakai cara massal:

1. Saring dulu (misalnya tahun 2019 saja) → **Simpan semua ke kontak HP**.
2. Impor berkas `.vcf` yang terunduh ke kontak HP.
3. Buka WhatsApp, segarkan daftar kontak. Nama berawalan **Cs** yang muncul berarti punya WhatsApp.
4. Yang tidak muncul, tandai lewat tombol **Catatan**.

---

## Format nama kontak

`Cs` + NAMA CUSTOMER + tanggal follow up, contoh:

```
Cs JENNY NOVA LEMBONG 06 Sep26
```

Awalan `Cs` dan bahasa singkatan bulan (Indonesia atau Inggris) bisa diganti di Pengaturan.
Tombol **Simpan kontak** pada kartu mengunduh satu kontak; tombol
**Simpan semua ke kontak HP** mengunduh seluruh hasil saringan dalam satu berkas.
