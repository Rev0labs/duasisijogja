/**
 * GOOGLE APPS SCRIPT - BACKEND TIGATAMA TALENT & EVENT ORGANIZER
 * 
 * Script ini berfungsi sebagai API (Backend CMS) untuk membaca dan menyimpan data
 * Landing Page TIGATAMA dari Google Sheets.
 */

// Password default admin untuk validasi simpan
const ADMIN_PASSWORD = "TIGAtama@123";

/**
 * Endpoint GET: Mengambil data Pengaturan, Layanan, Talent, dan Dokumentasi
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfMissing(ss);
    
    const configData = getConfigData(ss);
    const layananData = getLayananData(ss);
    const talentData = getTalentData(ss);
    const dokumentasiData = getDokumentasiData(ss);
    
    const response = {
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        config: configData,
        layanan: layananData,
        talents: talentData,
        dokumentasi: dokumentasiData
      }
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint POST: Menerima data dari Panel Config di Landing Page dan menyimpannya ke Sheet
 */
function doPost(e) {
  try {
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    
    // Validasi Password
    if (payload.password !== ADMIN_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Password Admin tidak valid!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfMissing(ss);
    
    // 0. Proses otomatis seluruh foto Base64 dan simpan ke Google Drive (Folder: TIGATAMA)
    if (payload.config) {
      if (payload.config.logo_url) {
        payload.config.logo_url = processAndSaveImageIfBase64(payload.config.logo_url, "logo_tigatama");
      }
      if (payload.config.hero_image) {
        payload.config.hero_image = processAndSaveImageIfBase64(payload.config.hero_image, "hero_banner");
      }
      if (payload.config.profil_img_1) {
        payload.config.profil_img_1 = processAndSaveImageIfBase64(payload.config.profil_img_1, "profil_1");
      }
      if (payload.config.profil_img_2) {
        payload.config.profil_img_2 = processAndSaveImageIfBase64(payload.config.profil_img_2, "profil_2");
      }
      if (payload.config.profil_img_3) {
        payload.config.profil_img_3 = processAndSaveImageIfBase64(payload.config.profil_img_3, "profil_3");
      }
    }
    
    if (payload.layanan && Array.isArray(payload.layanan)) {
      payload.layanan.forEach((l, idx) => {
        if (l.foto) {
          l.foto = processAndSaveImageIfBase64(l.foto, `layanan_${idx + 1}`);
        }
      });
    }
    
    if (payload.talents && Array.isArray(payload.talents)) {
      payload.talents.forEach((t, idx) => {
        if (t.foto) {
          const cleanName = (t.nama || `talent_${idx + 1}`).toLowerCase().replace(/[^a-z0-9]/g, "_");
          t.foto = processAndSaveImageIfBase64(t.foto, cleanName);
        }
      });
    }
    
    if (payload.dokumentasi && Array.isArray(payload.dokumentasi)) {
      payload.dokumentasi.forEach((d, idx) => {
        if (d.foto) {
          const cleanEvent = (d.event || `dok_${idx + 1}`).toLowerCase().replace(/[^a-z0-9]/g, "_");
          d.foto = processAndSaveImageIfBase64(d.foto, cleanEvent);
        }
      });
    }
    
    // 1. Simpan Pengaturan
    if (payload.config) {
      saveConfigData(ss, payload.config);
    }
    
    // 2. Simpan Layanan
    if (payload.layanan && Array.isArray(payload.layanan)) {
      saveLayananData(ss, payload.layanan);
    }
    
    // 3. Simpan Talent
    if (payload.talents && Array.isArray(payload.talents)) {
      saveTalentData(ss, payload.talents);
    }
    
    // 4. Simpan Dokumentasi
    if (payload.dokumentasi && Array.isArray(payload.dokumentasi)) {
      saveDokumentasiData(ss, payload.dokumentasi);
    }
    
    // Pastikan seluruh data langsung ter-flush ke sel Google Sheets
    SpreadsheetApp.flush();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data dan foto berhasil disimpan ke Google Drive (Folder: TIGATAMA) dan Google Sheets!",
      data: {
        config: payload.config,
        layanan: payload.layanan,
        talents: payload.talents,
        dokumentasi: payload.dokumentasi
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ================= GOOGLE DRIVE ASSET STORAGE ================= //

const DRIVE_FOLDER_NAME = "TIGATAMA";

/**
 * Mendapatkan atau membuat folder TIGATAMA di Google Drive dan set permission public view
 */
function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
  }
  
  // Set izin folder agar siapapun yang memiliki link bisa melihat foto
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    Logger.log("Folder setSharing note: " + err.toString());
  }
  return folder;
}

/**
 * Menyimpan data gambar Base64 ke folder Google Drive dan mengembalikan URL publik langsung (CDN lh3)
 */
function processAndSaveImageIfBase64(imageData, prefix) {
  if (!imageData || typeof imageData !== 'string') return imageData;
  
  // Hanya proses jika data berupa Base64 (data:image/...)
  if (!imageData.startsWith("data:image/")) {
    return imageData; // Sudah berupa URL biasa (http/https/assets/...)
  }
  
  try {
    const folder = getOrCreateDriveFolder();
    
    // Ekstrak MIME type dan Base64 string
    const parts = imageData.split(",");
    if (parts.length < 2) return imageData;
    
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const extension = (mimeType.split("/")[1] || "jpg").replace("+xml", "");
    const base64Data = parts[1];
    
    const decodedBytes = Utilities.base64Decode(base64Data);
    const safePrefix = (prefix || "foto").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${safePrefix}_${new Date().getTime()}.${extension}`;
    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
    
    const file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}
    
    const fileId = file.getId();
    // Gunakan URL CDN Google User Content agar gambar bisa tampil di tag <img> tanpa terblokir cookie
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  } catch (err) {
    Logger.log("Error save to Drive: " + err.toString());
    return imageData; // Fallback gunakan data lama jika terjadi kendala akses Drive
  }
}

// ================= BACA DATA ================= //

function getConfigData(ss) {
  const sheet = ss.getSheetByName("Pengaturan");
  const values = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < values.length; i++) {
    const key = values[i][0];
    const val = values[i][1];
    if (key) {
      config[key.toString().trim()] = val ? val.toString() : "";
    }
  }
  return config;
}

function getLayananData(ss) {
  const sheet = ss.getSheetByName("Layanan");
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const layanan = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0]) {
      layanan.push({
        judul: row[0] ? row[0].toString() : "",
        deskripsi: row[1] ? row[1].toString() : "",
        poin: row[2] ? row[2].toString() : "",
        foto: row[3] ? row[3].toString() : "",
        status: row[4] ? row[4].toString() : "Aktif"
      });
    }
  }
  return layanan;
}

function getTalentData(ss) {
  const sheet = ss.getSheetByName("Talent");
  const values = sheet.getDataRange().getValues();
  const talents = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0]) {
      talents.push({
        nama: row[0] ? row[0].toString() : "",
        kategori: row[1] ? row[1].toString() : "spg",
        tinggi: row[2] ? row[2].toString() : "",
        deskripsi: row[3] ? row[3].toString() : "",
        foto: row[4] ? row[4].toString() : "",
        status: row[5] ? row[5].toString() : "Aktif"
      });
    }
  }
  return talents;
}

function getDokumentasiData(ss) {
  const sheet = ss.getSheetByName("Dokumentasi");
  const values = sheet.getDataRange().getValues();
  const docs = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0]) {
      docs.push({
        event: row[0] ? row[0].toString() : "",
        kategori: row[1] ? row[1].toString() : "Event",
        keterangan: row[2] ? row[2].toString() : "",
        foto: row[3] ? row[3].toString() : "",
        status: row[4] ? row[4].toString() : "Aktif"
      });
    }
  }
  return docs;
}

// ================= SIMPAN DATA ================= //

function saveConfigData(ss, config) {
  const sheet = ss.getSheetByName("Pengaturan");
  const keys = Object.keys(config);
  const existingValues = sheet.getDataRange().getValues();
  const keyRowMap = {};
  for (let i = 1; i < existingValues.length; i++) {
    keyRowMap[existingValues[i][0].toString().trim()] = i + 1;
  }
  
  keys.forEach(k => {
    if (keyRowMap[k]) {
      sheet.getRange(keyRowMap[k], 2).setValue(config[k]);
    } else {
      sheet.appendRow([k, config[k], ""]);
    }
  });
}

function saveLayananData(ss, layanan) {
  const sheet = ss.getSheetByName("Layanan");
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 5).clearContent();
  }
  
  if (layanan.length > 0) {
    const rows = layanan.map(l => [
      l.judul || "",
      l.deskripsi || "",
      l.poin || "",
      l.foto || "",
      l.status || "Aktif"
    ]);
    sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  }
}

function saveTalentData(ss, talents) {
  const sheet = ss.getSheetByName("Talent");
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
  }
  
  if (talents.length > 0) {
    const rows = talents.map(t => [
      t.nama || "",
      t.kategori || "spg",
      t.tinggi || "",
      t.deskripsi || "",
      t.foto || "",
      t.status || "Aktif"
    ]);
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
}

function saveDokumentasiData(ss, docs) {
  const sheet = ss.getSheetByName("Dokumentasi");
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 5).clearContent();
  }
  
  if (docs.length > 0) {
    const rows = docs.map(d => [
      d.event || "",
      d.kategori || "Event",
      d.keterangan || "",
      d.foto || "",
      d.status || "Aktif"
    ]);
    sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  }
}

// ================= INISIALISASI SHEET OTOMATIS ================= //

function initSheetsIfMissing(ss) {
  // 1. Sheet Pengaturan
  let sheetConfig = ss.getSheetByName("Pengaturan");
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet("Pengaturan");
    const headers = [["Kunci (Key)", "Nilai (Value)", "Keterangan"]];
    const initialData = [
      ["nama_agensi", "TIGATAMA", "Nama brand agensi"],
      ["tagline", "Talent & Event Organizer", "Slogan singkat di bawah logo"],
      ["logo_url", "assets/logo.jpg", "URL logo default atau link gambar"],
      ["nomor_wa", "6281234567890", "Nomor WhatsApp aktif pemesanan"],
      ["akun_instagram", "@tigatama.organizer", "Akun Instagram agensi"],
      ["akun_tiktok", "@tigatama.organizer", "Akun TikTok agensi"],
      ["lokasi", "Yogyakarta & Jawa Tengah, Indonesia", "Wilayah operasional"],
      ["jam_operasional", "Senin - Minggu (08.00 - 22.00 WIB)", "Jam layanan fast response"],
      ["hero_badge", "Talent & SPG Agency Resmi Yogyakarta", "Badge kecil atas banner"],
      ["hero_headline", "Tingkatkan Citra Brand Anda Bersama TIGATAMA", "Judul utama website"],
      ["hero_deskripsi", "Penyedia SPG Event, Usher VIP, Model, & MC Profesional di Yogyakarta. Talent terkurasi dengan penampilan menarik, komunikatif, dan etos kerja terpercaya untuk kesuksesan pameran, expo, maupun resepsi Anda.", "Deskripsi di banner utama"],
      ["hero_image", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", "Foto utama di banner hero"],
      ["profil_deskripsi_1", "TIGATAMA hadir dengan komitmen tinggi menghadirkan standar mutu baru dalam industri talent dan manajemen acara (Talent & Event Organizer) di Yogyakarta. Filosofi \"TIGATAMA\" melambangkan tiga pilar utama kami: Kualitas Terkurasi (Quality), Ketepatan Waktu (Discipline), dan Integritas Kerja (Integrity).", "Paragraf 1 profil"],
      ["profil_deskripsi_2", "Kami memahami bahwa talent yang Anda pilih di garda depan adalah cerminan dari reputasi dan nilai brand Anda. Oleh karena itu, setiap talent yang tergabung di TIGATAMA telah melalui tahap kurasi ketat: memiliki kemampuan komunikasi aktif, pemahaman etika protokoler, serta kesiapan mental.", "Paragraf 2 profil"],
      ["profil_img_1", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop", "Foto profil galeri 1 (kiri atas)"],
      ["profil_img_2", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop", "Foto profil galeri 2 (kiri bawah)"],
      ["profil_img_3", "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop", "Foto profil galeri 3 (kanan)"],
      ["visi", "Menjadi mitra agensi talent dan event organizer yang paling terpercaya, profesional, dan berdaya saing tinggi di Yogyakarta serta Jawa Tengah, dengan selalu mengedepankan integritas, profesionalitas, dan kepuasan klien.", "Teks Visi"],
      ["misi_1", "Menyediakan talent yang tidak hanya menarik secara penampilan fisik, tetapi juga komunikatif, ramah, dan adaptif.", "Misi 1"],
      ["misi_2", "Memberikan pelayanan prima dan respon cepat bagi setiap calon mitra/klien yang membutuhkan talent.", "Misi 2"],
      ["misi_3", "Membangun ekosistem kerja yang saling menghargai antara agensi, talent, dan klien pengguna jasa.", "Misi 3"]
    ];
    sheetConfig.getRange(1, 1, 1, 3).setValues(headers).setFontWeight("bold").setBackground("#D4AF37");
    sheetConfig.getRange(2, 1, initialData.length, 3).setValues(initialData);
  }

  // 2. Sheet Layanan
  let sheetLayanan = ss.getSheetByName("Layanan");
  if (!sheetLayanan) {
    sheetLayanan = ss.insertSheet("Layanan");
    const headers = [["Judul Layanan", "Deskripsi", "Poin-poin Fitur (pisahkan dengan |)", "Link Foto", "Status"]];
    const initialLayanan = [
      ["SPG Event & Exhibition", "Sales Promotion Girl profesional untuk pameran otomotif, properti, mall roadshow, dan launching produk. Menguasai product knowledge dan ramah menyapa calon pembeli.", "Pameran & Expo (JEC, Mall, Hotel) | Flyering & Sampling Produk | Direct Selling & Leads Gathering", "", "Aktif"],
      ["Usher VIP & Penerima Tamu", "Penerima tamu berpenampilan anggun dengan etika protokoler standar tinggi untuk seminar nasional, gala dinner, resepsi pernikahan eksklusif, dan acara kenegaraan.", "Registrasi & Penyambutan Tamu VIP | Pendamping Podium / Plakat Penghargaan | Wedding Reception & Gala Dinner", "", "Aktif"],
      ["Model Photoshoot & Video", "Model pria & wanita berpengalaman untuk sesi pemotretan fashion, katalog busana, konten video promosi media sosial (TikTok/Reels), dan iklan komersial.", "Foto Katalog Fashion & Brand Lookbook | Talent Video Iklan & Review Produk | Model Make Up Artist (MUA)", "", "Aktif"],
      ["SPB (Sales Promotion Boy)", "Talent pria berpenampilan rapi, enerjik, dan percaya diri untuk promosi produk otomotif, gadget, merchandise, serta event olahraga/outdoor.", "Event Otomotif & Motorsport | Aktivasi Brand & Roadshow | Booth Assistant Pameran", "", "Aktif"],
      ["MC & Moderator Event", "Pembawa acara komunikatif yang piawai mencairkan suasana baik untuk format formal (seminar, wisuda) maupun non-formal (gathering, festival, konser).", "MC Formal & Protokoler | MC Entertainment & Gathering | Bilingual (Bahasa Indonesia & English)", "", "Aktif"],
      ["LO & Event Crew Support", "Tim pendamping tamu VIP/Artis (LO) dan kru lapangan yang tanggap, sigap, dan siap mendukung kelancaran operasional teknis acara Anda.", "Pendamping Tamu VIP / Narasumber | Crowd Control & Ticketing Support | Fleksibel & Tanggap Solusi", "", "Aktif"]
    ];
    sheetLayanan.getRange(1, 1, 1, 5).setValues(headers).setFontWeight("bold").setBackground("#D4AF37");
    sheetLayanan.getRange(2, 1, initialLayanan.length, 5).setValues(initialLayanan);
  }
  
  // 3. Sheet Talent
  let sheetTalent = ss.getSheetByName("Talent");
  if (!sheetTalent) {
    sheetTalent = ss.insertSheet("Talent");
    const headers = [["Nama", "Kategori (spg/usher/model)", "Tinggi (cm)", "Deskripsi / Keahlian", "Link Foto", "Status (Aktif/Nonaktif)"]];
    const initialTalents = [
      ["Nadine A.", "spg", "168 cm", "Bahasa: Indo, Inggris Aktif", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=700&auto=format&fit=crop", "Aktif"],
      ["Clara V.", "usher", "170 cm", "Berpengalaman Event Kenegaraan", "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=700&auto=format&fit=crop", "Aktif"],
      ["Rian D.", "model", "178 cm", "Model Fashion & Otomotif", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop", "Aktif"],
      ["Jessica M.", "spg", "167 cm", "Spesialis Direct Selling", "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=700&auto=format&fit=crop", "Aktif"],
      ["Siti Sarah", "usher", "169 cm", "Ramah, Sigap & Santun", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop", "Aktif"],
      ["Fiona K.", "model", "166 cm", "Public Speaking | MC Formal & Gathering", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop", "Aktif"]
    ];
    sheetTalent.getRange(1, 1, 1, 6).setValues(headers).setFontWeight("bold").setBackground("#D4AF37");
    sheetTalent.getRange(2, 1, initialTalents.length, 6).setValues(initialTalents);
  }
  
  // 4. Sheet Dokumentasi
  let sheetDoc = ss.getSheetByName("Dokumentasi");
  if (!sheetDoc) {
    sheetDoc = ss.insertSheet("Dokumentasi");
    const headers = [["Nama Event", "Kategori", "Keterangan", "Link Foto", "Status (Aktif/Nonaktif)"]];
    const initialDocs = [
      ["Pameran Otomotif Expo Jogja", "Exhibition", "SPG Booth & Flyering Produk", "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=700&auto=format&fit=crop", "Aktif"],
      ["Gala Dinner Perusahaan Nasional", "Usher VIP", "Penyambutan Tamu VVIP di Ballroom", "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=700&auto=format&fit=crop", "Aktif"],
      ["Launching Fashion Brand Lokal", "Fashion Show", "Model Katalog & Peraga Busana", "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=700&auto=format&fit=crop", "Aktif"]
    ];
    sheetDoc.getRange(1, 1, 1, 5).setValues(headers).setFontWeight("bold").setBackground("#D4AF37");
    sheetDoc.getRange(2, 1, initialDocs.length, 5).setValues(initialDocs);
  }
}
