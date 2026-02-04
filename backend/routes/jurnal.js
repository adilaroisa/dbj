const express = require('express');
const router = express.Router();
const Jurnal = require('../models/jurnal');
const { fetchSintaData } = require('../services/SintaServices');
const auth = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// --- 1. IMPORT EXCEL (Sesuai Flowchart: Upload & Ekstrak) ---
router.post('/import', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File Excel wajib diupload' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let successCount = 0;

        for (const row of data) {
            // Mapping Kolom Excel -> Database
            const nama = row['Nama Jurnal'] || row['Nama'] || 'Tanpa Nama';
            const penerbit = row['Institusi'] || row['Penerbit'] || '-';
            const issn = row['ISSN'] ? String(row['ISSN']).replace(/-/g, '') : null;
            const email = row['Email'] || null;
            const kontak = row['Kontak'] || row['WA'] || row['HP'] || null;
            const url = row['Website'] || row['URL'] || null;
            const member_doi_rji = row['Member RJI'] ? true : false;

            // Cek Duplikasi (Berdasarkan ISSN atau Nama)
            const existing = await Jurnal.findOne({ 
                where: issn ? { issn } : { nama } 
            });

            if (!existing) {
                await Jurnal.create({
                    nama, penerbit, issn, email, kontak, url, member_doi_rji
                });
                successCount++;
            }
        }

        fs.unlinkSync(req.file.path);
        res.json({ message: `Import Berhasil! ${successCount} jurnal baru ditambahkan.` });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Gagal Import: ' + err.message });
    }
});

// --- 2. SYNC SINTA (Fitur Utama: Validasi & Sinkronisasi) ---
router.patch('/:id/sync-sinta', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const jurnal = await Jurnal.findByPk(id);

        if (!jurnal || !jurnal.issn) {
            return res.status(400).json({ message: 'ISSN kosong, silakan input manual terlebih dahulu.' });
        }

        // Panggil Service Sinta
        const sintaData = await fetchSintaData(jurnal.issn);

        if (sintaData) {
            // Update Data Sesuai Transkrip & Flowchart
            jurnal.akreditasi = sintaData.score; // S1-S6
            jurnal.sinta_id = sintaData.sintaId;
            jurnal.url_sinta = `https://sinta.kemdiktisaintek.go.id/journals/profile/${sintaData.sintaId}`;
            
            // Tambahan: Update URL Garuda (Sesuai permintaan flowchart)
            jurnal.url_garuda = `https://garuda.kemdikbud.go.id/journal/view/${sintaData.garudaId}`;
            
            await jurnal.save();

            return res.json({ message: 'Sync Sukses! Data Sinta & Garuda terupdate.', data: sintaData });
        } else {
            // Jika tidak ditemukan di Sinta
            jurnal.akreditasi = "Belum Terakreditasi";
            await jurnal.save();
            return res.status(404).json({ message: 'Data tidak ditemukan di Sinta (ISSN mungkin salah/belum terdaftar).' });
        }

    } catch (err) {
        res.status(500).json({ message: 'Gagal Sync: ' + err.message });
    }
});

// --- CRUD STANDAR ---
router.get('/', async (req, res) => {
    try {
        // Urutkan yang terbaru di atas
        const jurnals = await Jurnal.findAll({ order: [['updatedAt', 'DESC']] });
        res.json(jurnals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const jurnal = await Jurnal.create(req.body);
        res.status(201).json(jurnal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        await Jurnal.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Update berhasil' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Jurnal.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;