# Landing Page Agensi - Dua Sisi Jogja (Dinamis + Admin Panel)

Landing page responsif, modern, dan dinamis untuk agensi talent, usher, dan SPG event **Dua Sisi Jogja**. 
Website di-hosting gratis di **GitHub Pages** dan terintegrasi dengan **Google Sheets & Google Apps Script** sebagai database CMS.

---

## 🌟 Fitur Utama
1. **Frontend Modern (GitHub Pages - Rp 0 Selamanya):**
   - Single-page responsive (mobile-friendly).
   - Fast loading & SEO/OpenGraph preview untuk WhatsApp / Medsos.
2. **Katalog Talent Dinamis:**
   - Filter instan kategori: *Semua*, *SPG Event*, *Usher VIP*, *Model & MC*.
   - Tombol direct booking WhatsApp per talent.
3. **Dokumentasi Kegiatan Event Dinamis:**
   - Menampilkan portofolio foto acara nyata.
4. **Panel Admin / Config Terintegrasi di Halaman Index (`index.html`):**
   - Tombol **Admin Config** tersembunyi di footer halaman.
   - Diproteksi Password Admin (`TIGAtama@123`).
   - Bisa ganti: Logo, Nomor WhatsApp (otomatis merubah semua tombol), Akun IG, TikTok, Lokasi, Jam Kerja, Banner Headline, Deskripsi, Visi Misi.
   - Bisa **Tambah, Edit, Nonaktifkan, & Hapus Talent** kapan saja.
   - Bisa **Tambah & Hapus Foto Dokumentasi Kegiatan**.
   - Menyimpan ke cache lokal dan langsung ke Google Sheets!

---

## 🔑 Akses Panel Admin di Website
1. Buka website di browser: `https://rev0labs.github.io/duasisijogja/` (atau buka `index.html` lokal).
2. Scroll ke bagian paling bawah (**Footer**).
3. Klik tombol **`[🔒 Admin Config]`** di samping kanan teks copyright.
4. Masukkan password: **`TIGAtama@123`** lalu klik **Buka Panel Config**.
5. Silakan ubah data, tambah talent, atau ganti nomor WhatsApp, lalu klik **💾 Simpan Perubahan**.

---

## 📊 Cara Pasang Backend Google Sheets (Google Apps Script)
Jika ingin menghubungkan ke Google Sheets agar data bisa tersimpan secara permanen di akun Google Drive:

1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru. Beri judul misalnya: `Database Dua Sisi Jogja`.
2. Klik menu **Extensions (Ekstensi)** &rarr; **Apps Script**.
3. Hapus kode bawaan, lalu salin (copy) seluruh isi file:
   📂 `google-apps-script/Code.gs`
   dan paste ke editor Apps Script.
4. Klik tombol **Save (Simpan / ikon disket)**.
5. Klik tombol **Deploy (Terapkan)** di pojok kanan atas &rarr; pilih **New deployment (Penerapan baru)**.
6. Klik ikon gerigi di sebelah *Select type* &rarr; pilih **Web app**.
7. Konfigurasi:
   - **Description**: `API Dua Sisi Jogja`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: **`Anyone` (Siapa saja)** *(PENTING agar website bisa membaca data)*
8. Klik **Deploy** &rarr; Berikan izin akses Google (*Authorize access*).
9. Salin (Copy) **Web App URL** yang dihasilkan (format: `https://script.google.com/macros/s/.../exec`).
10. Buka website Dua Sisi Jogja &rarr; Buka **Admin Config** &rarr; Buka tab **🔗 Koneksi Spreadsheet** &rarr; Tempelkan URL tersebut &rarr; Klik **Simpan**.

*Catatan: Saat script pertama kali berjalan, tab `Pengaturan`, `Talent`, dan `Dokumentasi` di Google Sheets akan otomatis dibuat beserta data awalnya!*

---

## 🚀 Cara Push Pembaruan Ini ke GitHub
Buka PowerShell di komputer Anda:
```powershell
cd "C:\Users\junre\.gemini\antigravity\scratch\dua-sisi-jogja"
git add .
git commit -m "Add dynamic CMS, Admin Config panel, and Google Apps Script integration"
git push origin main
```
Tunggu 1 menit, dan website di `https://rev0labs.github.io/duasisijogja/` akan otomatis ter-update dengan fitur baru ini!
