/**
 * API_Followup.gs — jembatan antara spreadsheet "DO DHT 2013-JUL 2021"
 * dan aplikasi Follow Up Pelanggan (index.html).
 *
 * Pasang: script.google.com > Proyek baru > tempel file ini >
 * Deploy > New deployment > Web app > Execute as: Me,
 * Who has access: Anyone > salin URL /exec ke Pengaturan aplikasi.
 */

var SPREADSHEET_ID = '14BioChiVzsyy8lYSHTi5yLzXoLwJhYGAajJVFwJd9aU';
var GID_DATA       = 1480954882;      // tab sumber data DO
var SHEET_CATATAN  = 'FOLLOW UP';     // dibuat otomatis kalau belum ada

var KOLOM_CATATAN = ['RID', 'NAMA', 'NO HP', 'STATUS', 'HASIL PEMBICARAAN TERAKHIR',
  'TGL FOLLOW UP TERAKHIR', 'RENCANA FOLLOW UP', 'BUKAN WA', 'TRANSKRIP', 'DIPERBARUI'];

/* ---------------------------------------------------------------- utilitas */

function buka_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function sheetData_() {
  var ss = buka_(), sh = ss.getSheets();
  for (var i = 0; i < sh.length; i++) if (sh[i].getSheetId() === GID_DATA) return sh[i];
  return ss.getSheets()[0];
}

function sheetCatatan_() {
  var ss = buka_(), sh = ss.getSheetByName(SHEET_CATATAN);
  if (!sh) {
    sh = ss.insertSheet(SHEET_CATATAN);
    sh.getRange(1, 1, 1, KOLOM_CATATAN.length).setValues([KOLOM_CATATAN])
      .setFontWeight('bold').setBackground('#0F2E47').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 80); sh.setColumnWidth(2, 220); sh.setColumnWidth(5, 380);
  }
  return sh;
}

function balas_(obj, e) {
  var teks = JSON.stringify(obj);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + teks + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(teks)
    .setMimeType(ContentService.MimeType.JSON);
}

function rapikan_(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(v).replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------ doGet */

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'meta':    return balas_(meta_(), e);
      case 'rows':    return balas_(rows_(p), e);
      case 'catatan': return balas_(bacaCatatan_(), e);
      case 'simpan':  return balas_(simpan_(JSON.parse(p.data || '{}')), e);   // cadangan JSONP
      default:        return balas_({ ok: true, pesan: 'API Follow Up siap', waktu: new Date().toISOString() }, e);
    }
  } catch (err) {
    return balas_({ ok: false, error: String(err && err.message || err) }, e);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (body.action === 'simpan')     return balas_(simpan_(body), e);
    if (body.action === 'simpanBanyak') return balas_(simpanBanyak_(body.daftar || []), e);
    if (body.action === 'ubahSel')    return balas_(ubahSel_(body), e);
    return balas_({ ok: false, error: 'action tidak dikenal' }, e);
  } catch (err) {
    return balas_({ ok: false, error: String(err && err.message || err) }, e);
  }
}

/* ------------------------------------------------------------------- meta */

function meta_() {
  var sh = sheetData_();
  var kolomTerakhir = sh.getLastColumn();
  var judul = sh.getRange(1, 1, 1, kolomTerakhir).getDisplayValues()[0].map(function (h, i) {
    var t = rapikan_(h);
    return t || ('Kolom ' + (i + 1));
  });
  return {
    ok: true,
    sheet: sh.getName(),
    gid: sh.getSheetId(),
    total: Math.max(0, sh.getLastRow() - 1),
    kolom: judul,
    tebakan: tebakPemetaan_(judul)
  };
}

/** Menebak kolom mana dipakai untuk apa. Bisa diubah manual di aplikasi. */
function tebakPemetaan_(judul) {
  var n = judul.map(function (h) { return h.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  function cari(daftar, kecuali) {
    for (var d = 0; d < daftar.length; d++) {
      for (var i = 0; i < n.length; i++) {
        if (n[i] === daftar[d] && (!kecuali || n[i].indexOf(kecuali) < 0)) return i;
      }
    }
    for (var d2 = 0; d2 < daftar.length; d2++) {
      for (var j = 0; j < n.length; j++) {
        if (n[j].indexOf(daftar[d2]) === 0 && (!kecuali || n[j].indexOf(kecuali) < 0)) return j;
      }
    }
    return -1;
  }
  return {
    nama:     cari(['CUSTOMER', 'NAMACUSTOMER', 'NAMASTNK']),
    hp:       cari(['HANDPHONE', 'NOHP', 'TELEPHONE', 'TELPRUMAH']),
    hp2:      cari(['TELEPHONE', 'TELPRUMAH', 'TELPKANTOR']),
    kota:     cari(['CITY', 'KOTA']),
    tipe:     cari(['GROUPING', 'TIPEKENDARAAN', 'TIPE']),
    varian:   cari(['KAROSERISPEC', 'TIPEKENDARAAN', 'MATERIALDESCRIPTION']),
    salesman: cari(['NAMASALESMAN', 'SALESMAN', 'NAMASLS']),
    tanggal:  cari(['TGLFAKTUR', 'TGLDO', 'TGLBSTK']),
    tahun:    cari(['TAHUN', 'YSALE', 'YEAR']),
    bulan:    cari(['BULAN', 'MONTH']),
    alamat:   cari(['ADDRESS', 'ALAMAT']),
    cabang:   cari(['CABANG', 'OUTLET', 'PLANT']),
    leasing:  cari(['LEASING']),
    nopol:    cari(['NOPOLISI', 'REGNO']),
    faktur:   cari(['NOFAKTUR', 'FILLINGNO'])
  };
}

/* ------------------------------------------------------------------- rows */

/**
 * params: start (0-based), limit, pick ("3,5,9" indeks kolom 0-based)
 * balikan: { rows: [[rid, nilai...]], start, jumlah, total }
 */
function rows_(p) {
  var sh = sheetData_();
  var total = Math.max(0, sh.getLastRow() - 1);
  var start = Math.max(0, parseInt(p.start || '0', 10));
  var limit = Math.min(4000, Math.max(1, parseInt(p.limit || '2000', 10)));
  if (start >= total) return { ok: true, rows: [], start: start, jumlah: 0, total: total };
  limit = Math.min(limit, total - start);

  var pick = (p.pick || '').split(',').map(function (x) { return parseInt(x, 10); })
    .filter(function (x) { return !isNaN(x) && x >= 0; });
  var lebar = sh.getLastColumn();
  if (!pick.length) { pick = []; for (var i = 0; i < Math.min(lebar, 20); i++) pick.push(i); }

  var nilai = sh.getRange(start + 2, 1, limit, lebar).getDisplayValues();
  var out = [];
  for (var r = 0; r < nilai.length; r++) {
    var baris = ['R' + (start + 2 + r)];
    for (var c = 0; c < pick.length; c++) baris.push(rapikan_(nilai[r][pick[c]]));
    out.push(baris);
  }
  return { ok: true, rows: out, start: start, jumlah: out.length, total: total };
}

/* ---------------------------------------------------------------- catatan */

function bacaCatatan_() {
  var sh = sheetCatatan_();
  var n = sh.getLastRow() - 1;
  if (n < 1) return { ok: true, catatan: [] };
  var v = sh.getRange(2, 1, n, KOLOM_CATATAN.length).getDisplayValues();
  var out = [];
  for (var i = 0; i < v.length; i++) {
    if (!v[i][0]) continue;
    out.push({
      rid: v[i][0], nama: v[i][1], hp: v[i][2], status: v[i][3], hasil: v[i][4],
      terakhir: v[i][5], rencana: v[i][6], bukanWa: String(v[i][7]).toUpperCase() === 'YA',
      transkrip: v[i][8], diperbarui: v[i][9]
    });
  }
  return { ok: true, catatan: out };
}

function petaRid_(sh) {
  var n = sh.getLastRow() - 1, peta = {};
  if (n < 1) return peta;
  var v = sh.getRange(2, 1, n, 1).getDisplayValues();
  for (var i = 0; i < v.length; i++) if (v[i][0]) peta[v[i][0]] = i + 2;
  return peta;
}

function barisCatatan_(d) {
  return [d.rid || '', d.nama || '', d.hp || '', d.status || '', d.hasil || '',
    d.terakhir || '', d.rencana || '', d.bukanWa ? 'YA' : '', d.transkrip || '',
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm')];
}

function simpan_(d) {
  if (!d || !d.rid) return { ok: false, error: 'rid kosong' };
  var kunci = LockService.getScriptLock();
  kunci.waitLock(20000);
  try {
    var sh = sheetCatatan_(), peta = petaRid_(sh), baris = barisCatatan_(d);
    var r = peta[d.rid];
    if (r) sh.getRange(r, 1, 1, KOLOM_CATATAN.length).setValues([baris]);
    else   sh.appendRow(baris);
    return { ok: true, rid: d.rid };
  } finally { kunci.releaseLock(); }
}

function simpanBanyak_(daftar) {
  var kunci = LockService.getScriptLock();
  kunci.waitLock(30000);
  try {
    var sh = sheetCatatan_(), peta = petaRid_(sh), baru = [], n = 0;
    for (var i = 0; i < daftar.length; i++) {
      var d = daftar[i]; if (!d || !d.rid) continue;
      var baris = barisCatatan_(d), r = peta[d.rid];
      if (r) { sh.getRange(r, 1, 1, KOLOM_CATATAN.length).setValues([baris]); }
      else   { baru.push(baris); peta[d.rid] = sh.getLastRow() + baru.length; }
      n++;
    }
    if (baru.length) sh.getRange(sh.getLastRow() + 1, 1, baru.length, KOLOM_CATATAN.length).setValues(baru);
    return { ok: true, jumlah: n };
  } finally { kunci.releaseLock(); }
}

/** Memperbaiki isi sel di sheet sumber (mis. nomor HP salah / nama typo). */
function ubahSel_(d) {
  var baris = parseInt(String(d.rid || '').replace(/^R/, ''), 10);
  var kolom = parseInt(d.kolom, 10) + 1;
  if (!baris || baris < 2 || !kolom || kolom < 1) return { ok: false, error: 'alamat sel tidak sah' };
  var sh = sheetData_();
  sh.getRange(baris, kolom).setValue(String(d.nilai === undefined ? '' : d.nilai));
  return { ok: true };
}

/* ------------------------------------------------------- uji dari editor */

function ujiCepat() {
  Logger.log(JSON.stringify(meta_(), null, 2));
  Logger.log(JSON.stringify(rows_({ start: 0, limit: 2, pick: '0,1,2' })));
}
