# Landing Page Agensi - TIGATAMA Talent & Event Organizer (Dinamis + Admin Panel)

Landing page responsif, modern, dan dinamis untuk agensi talent, usher, model, dan SPG event **TIGATAMA - Talent & Event Organizer**. 
Website di-hosting gratis di **GitHub Pages** dan terintegrasi dengan **Google Sheets & Google Apps Script** sebagai database CMS.

---

## 🌟 Fitur Utama
1. **Frontend Modern & Mewah (GitHub Pages - Rp 0 Selamanya):**
   - Single-page responsive (mobile-friendly) dengan tema luxury black & gold sesuai logo resmi TIGATAMA.
   - Fast loading & SEO/OpenGraph preview untuk WhatsApp / Medsos menggunakan logo resmi.
2. **Katalog Talent Dinamis:**
   - Filter instan kategori: *Semua*, *SPG Event*, *Usher VIP*, *Model & MC*.
   - Tombol direct booking WhatsApp per talent.
3. **Dokumentasi Kegiatan Event Dinamis:**
   - Menampilkan portofolio foto acara nyata.
4. **Panel Admin / Config Terintegrasi di Halaman Index (`index.html`):**
   - Tombol login admin berupa ikon gembok kecil elegan di pojok kanan atas navbar (tidak mengganggu layout).
   - Sidebar admin di sisi kiri yang rapi dan bisa di-collapse/hide menjadi icon saja.
   - Modal edit talent lengkap dalam satu popup (bisa ubah semua info sekaligus).
   - Fitur **Upload Foto langsung** dari HP/laptop dengan kompresi otomatis (tidak perlu paste URL gambar manual).
   - Layanan agensi dinamis (bisa tambah, edit, atau nonaktifkan layanan).
   - Diproteksi Password Admin (`TIGAtama@123`).
   - Menyimpan ke cache lokal dan langsung tersinkron ke Google Sheets!

---

## 🔑 Akses Panel Admin di Website
1. Buka website di browser: `https://rev0labs.github.io/duasisijogja/` (atau buka `index.html` lokal).
2. Klik ikon **Gembok (🔒)** kecil di pojok kanan atas navbar.
3. Masukkan password: **`TIGAtama@123`** lalu klik **Buka Panel Config**.
4. Silakan ubah data, upload foto talent/logo/hero, atau kelola layanan, lalu klik **💾 Simpan Semua Perubahan**.

---

## 📊 Cara Pasang Backend Google Sheets (Google Apps Script)
Jika ingin menghubungkan ke Google Sheets agar data bisa tersimpan secara permanen di akun Google Drive:

1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru. Beri judul misalnya: `Database TIGATAMA Organizer`.
2. Klik menu **Extensions (Ekstensi)** &rarr; **Apps Script**.
3. Hapus kode bawaan, lalu salin (copy) seluruh isi file:
   📂 `google-apps-script/Code.gs`
   dan paste ke editor Apps Script.
4. Klik tombol **Save (Simpan / ikon disket)**.
5. Klik tombol **Deploy (Terapkan)** di pojok kanan atas &rarr; pilih **New deployment (Penerapan baru)**.
6. Klik ikon gerigi di sebelah *Select type* &rarr; pilih **Web app**.
7. Konfigurasi:
   - **Description**: `API TIGATAMA Organizer`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: **`Anyone` (Siapa saja)** *(PENTING agar website bisa membaca data)*
8. Klik **Deploy** &rarr; Berikan izin akses Google (*Authorize access*).
9. Salin (Copy) **Web App URL** yang dihasilkan (format: `https://script.google.com/macros/s/.../exec`).
10. Buka website TIGATAMA &rarr; Buka **Admin Config** &rarr; Buka tab **🔗 Koneksi Spreadsheet** &rarr; Tempelkan URL tersebut &rarr; Klik **Simpan**.

*Catatan: Saat script pertama kali berjalan, tab `Pengaturan`, `Layanan`, `Talent`, dan `Dokumentasi` di Google Sheets akan otomatis dibuat beserta data awalnya!*

---

## 🚀 Cara Push Pembaruan Ini ke GitHub
Buka PowerShell di komputer Anda:
```powershell
cd "C:\Users\junre\.gemini\antigravity\scratch\dua-sisi-jogja"
git add .
git commit -m "Integrate official TIGATAMA logo and luxury gold branding"
git push origin main
```
Tunggu 1 menit, dan website di `https://rev0labs.github.io/duasisijogja/` akan otomatis ter-update!
