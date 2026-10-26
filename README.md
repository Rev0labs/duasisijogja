# Landing Page Agensi - TIGATAMA Talent & Event Organizer (Dinamis + Admin Panel)

Landing page responsif, modern, dan dinamis untuk agensi talent, usher, model, dan SPG event **TIGATAMA - Talent & Event Organizer**. 
Website di-hosting gratis di **GitHub Pages** dan terintegrasi dengan **Google Sheets & Google Apps Script** sebagai database CMS.

---

## 🌟 Fitur Utama
1. **Frontend Modern & Mewah (GitHub Pages - Rp 0 Selamanya):**
   - Single-page responsive (mobile-friendly) dengan tema luxury black & gold sesuai logo resmi TIGATAMA.
   - Fast loading & SEO/OpenGraph preview untuk WhatsApp / Medsos menggunakan logo resmi.
2. **Katalog Talent & Armada Transportasi Dinamis:**
   - Navigasi header menuju **Katalog** dengan tab switcher interaktif: **Katalog Talent** & **Armada Transportasi**.
   - Filter instan kategori talent dan kategori armada secara otomatis dan fleksibel.
   - Tombol direct booking WhatsApp per talent dan per armada (HiAce, Alphard, Innova, Bus, dll).
3. **Dokumentasi Kegiatan Event Dinamis:**
   - Menampilkan portofolio foto acara nyata.
4. **Panel Admin / Config Terintegrasi di Halaman Index (`index.html`):**
   - Tombol login admin berupa ikon gembok kecil elegan di pojok kanan atas navbar (tidak mengganggu layout).
   - Sidebar admin di sisi kiri yang rapi dan bisa di-collapse/hide menjadi icon saja.
   - Modal edit talent dan modal edit armada lengkap dalam popup (bisa tambah, ubah, dan hapus unit armada).
   - Fitur **Upload Foto langsung** dari HP/laptop dengan kompresi otomatis (tidak perlu paste URL gambar manual).
   - Layanan agensi dinamis (bisa tambah, edit, atau nonaktifkan layanan).
   - Diproteksi Password Admin (`TIGAtama@123`).
   - Menyimpan ke cache lokal dan langsung tersinkron ke Google Sheets & Google Drive!

---

## 🔑 Akses Panel Admin di Website
1. Buka website di browser: `https://tigatama.com/` (atau `https://rev0labs.github.io/tigatama/`).
2. Klik ikon **Gembok (🔒)** kecil di pojok kanan atas navbar (atau tombol Admin di top announcement bar).
3. Masukkan password: **`TIGAtama@123`** lalu klik **Buka Panel Config**.
4. Silakan ubah data, upload foto talent/logo/hero/profil, atau kelola layanan, lalu klik **💾 Simpan Semua Perubahan**.

---

## 📊 Cara Pasang Backend Google Sheets (Google Apps Script & Google Drive)
Jika ingin menghubungkan ke Google Sheets & Google Drive agar data foto dan profil tersimpan secara permanen:

1. Buka [Google Sheets](https://sheets.new) (atau spreadsheet Anda: `DATABASE TIGATAMA`).
2. Klik menu **Extensions (Ekstensi)** &rarr; **Apps Script**.
3. Hapus kode bawaan, lalu salin (copy) seluruh isi file:
   📂 `google-apps-script/Code.gs`
   dan paste ke editor Apps Script.
4. Klik tombol **Save (Simpan / ikon disket)**.
5. **Otorisasi Google Drive (PENTING 1x Saja):**
   - Pada toolbar atas di sebelah tombol Run/Jalankan, pilih fungsi **`testDrivePermission`**.
   - Klik **Run (Jalankan)**.
   - Pop-up Google akan muncul: Klik **Review Permissions** &rarr; Pilih akun Google &rarr; Klik **Advanced (Lanjutan)** &rarr; Klik **Go to (Buka)... (unsafe)** &rarr; Klik **Allow (Izinkan)**.
   - Folder **TIGATAMA** akan otomatis dibuat di Google Drive Anda.
6. Klik tombol **Deploy (Terapkan)** di pojok kanan atas &rarr; pilih **New deployment (Penerapan baru)** (atau *Manage deployments* &rarr; *Edit* &rarr; *New version* jika sudah pernah deploy).
7. Konfigurasi:
   - **Description**: `API TIGATAMA Organizer & Drive`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: **`Anyone` (Siapa saja)** *(PENTING agar website bisa membaca data)*
8. Klik **Deploy** &rarr; Salin (Copy) **Web App URL** yang dihasilkan (format: `https://script.google.com/macros/s/.../exec`).
9. **Sinkronisasi ke Seluruh Perangkat (HP / Laptop Lain):**
   - Masukkan Web App URL tersebut ke variabel `DEFAULT_API_URL` pada baris 1445 file `index.html`, lalu push ke GitHub. Dengan cara ini, **setiap orang / HP / browser lain yang membuka website akan otomatis langsung membaca data terbaru dari Google Sheets & Drive!**
   - Atau tempelkan Web App URL tersebut di **Panel Admin &rarr; Koneksi Spreadsheet** &rarr; Klik **Simpan**.

*Catatan: Saat script pertama kali berjalan, tab `Pengaturan`, `Layanan`, `Talent`, `Armada`, dan `Dokumentasi` di Google Sheets akan otomatis dibuat beserta data awalnya!*

---

## 🚀 Cara Push Pembaruan Ini ke GitHub
Buka PowerShell di komputer Anda:
```powershell
cd "C:\Users\junre\.gemini\antigravity\scratch\dua-sisi-jogja"
git push origin main
```
Tunggu 1 menit, dan website di `https://tigatama.com/` (dan `https://rev0labs.github.io/tigatama/`) akan otomatis aktif/ter-update!
