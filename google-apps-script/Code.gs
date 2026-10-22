/**
 * GOOGLE APPS SCRIPT - BACKEND DUA SISI JOGJA
 * 
 * Script ini berfungsi sebagai API (Backend) untuk membaca dan menyimpan data
 * Landing Page Dua Sisi Jogja dari Google Sheets.
 */

// Password default admin untuk validasi simpan
const ADMIN_PASSWORD = "admin123";

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
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data website Dua Sisi Jogja berhasil disimpan!"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
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
      ["nama_agensi", "Dua Sisi Jogja", "Nama brand agensi"],
      ["tagline", "Talent & Event Agency", "Slogan singkat di bawah logo"],
      ["logo_url", "", "URL logo (kosongkan jika pakai teks)"],
      ["nomor_wa", "6281234567890", "Nomor WhatsApp aktif pemesanan"],
      ["akun_instagram", "@duasisijogja", "Akun Instagram agensi"],
      ["akun_tiktok", "@duasisijogja", "Akun TikTok agensi"],
      ["lokasi", "Yogyakarta & Jawa Tengah, Indonesia", "Wilayah operasional"],
      ["jam_operasional", "Senin - Minggu (08.00 - 22.00 WIB)", "Jam layanan fast response"],
      ["hero_badge", "Talent & SPG Agency Resmi Yogyakarta", "Badge kecil atas banner"],
      ["hero_headline", "Tingkatkan Citra Brand Anda Bersama Dua Sisi Jogja", "Judul utama website"],
      ["hero_deskripsi", "Penyedia SPG Event, Usher VIP, Model, & MC Profesional di Yogyakarta. Talent terkurasi dengan penampilan menarik, komunikatif, dan etos kerja terpercaya untuk kesuksesan pameran, expo, maupun resepsi Anda.", "Deskripsi di banner utama"],
      ["hero_image", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", "Foto utama di banner hero"],
      ["profil_deskripsi_1", "Dua Sisi Jogja lahir dengan visi menghadirkan standar baru dalam industri agensi talent di Yogyakarta. Filosofi \"Dua Sisi\" melambangkan keseimbangan sempurna antara penampilan visual yang elegan (Beauty) dan profesionalisme kerja yang berintegritas (Integrity).", "Paragraf 1 profil"],
      ["profil_deskripsi_2", "Kami memahami bahwa talent yang Anda pilih di garda depan adalah cerminan dari reputasi dan nilai brand Anda. Oleh karena itu, setiap talent yang tergabung di Dua Sisi Jogja telah melalui tahap kurasi ketat: memiliki kemampuan komunikasi aktif, pemahaman etika protokoler, serta kesiapan mental.", "Paragraf 2 profil"],
      ["visi", "Menjadi agensi penyedia talent dan SPG event yang paling terpercaya, profesional, dan berdaya saing tinggi di Yogyakarta serta Jawa Tengah, dengan selalu mengedepankan integritas, profesionalitas, dan kepuasan klien.", "Teks Visi"],
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
