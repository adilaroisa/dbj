const Jurnal = require('../models/jurnal');
const { fetchSintaData } = require('../services/SintaServices');
const xlsx = require('xlsx');
const fs = require('fs');

const getAllJurnals = async (req, res) => {
    try {
        const jurnals = await Jurnal.findAll({ order: [['penerbit', 'ASC'], ['nama', 'ASC']] });
        res.status(200).json(jurnals); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createJurnal = async (req, res) => {
    try {
        const { issn, nama } = req.body;
        const existing = await Jurnal.findOne({ where: issn ? { issn } : { nama } });
        if (existing) return res.status(400).json({ message: 'Gagal: Jurnal sudah terdaftar.' });

        const jurnal = await Jurnal.create(req.body);
        res.status(201).json(jurnal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateJurnal = async (req, res) => {
    try {
        await Jurnal.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Update berhasil' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteJurnal = async (req, res) => {
    try {
        const deleted = await Jurnal.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: "Tidak ditemukan." });
        res.status(200).json({ message: 'Terhapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const importExcel = async (req, res) => {
    // (Kode Import Excel biarkan seperti sebelumnya / tidak berubah)
    // ... Copy paste logika import excel sebelumnya jika perlu, atau biarkan file lama untuk fungsi ini
    try {
        if (!req.file) return res.status(400).json({ message: 'File Excel wajib diupload' });
        const workbook = xlsx.readFile(req.file.path);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        let successCount = 0;
        for (const row of data) {
            const nama = row['Nama Jurnal'] || row['Nama'] || 'Tanpa Nama';
            const penerbit = row['Institusi'] || row['Penerbit'] || '-';
            const issn = row['ISSN'] ? String(row['ISSN']).replace(/-/g, '') : null;
            const existing = await Jurnal.findOne({ where: issn ? { issn } : { nama } });
            if (!existing) {
                await Jurnal.create({
                    nama, penerbit, issn,
                    email: row['Email'], kontak: row['Kontak'], url: row['Website'],
                    member_doi_rji: String(row['Member RJI']).toLowerCase() === 'ya',
                    akreditasi: row['Akreditasi'], url_sinta: row['URL Sinta']
                });
                successCount++;
            }
        }
        fs.unlinkSync(req.file.path);
        res.json({ message: `Import Berhasil! ${successCount} data masuk.` });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: err.message });
    }
};

const syncSinta = async (req, res) => {
    try {
        const { id } = req.params;
        const jurnal = await Jurnal.findByPk(id);
        if (!jurnal) return res.status(404).json({ message: 'Jurnal tidak ditemukan.' });

        // LOGIKA BARU: Kirim ISSN DAN URL yang tersimpan di DB
        // Jadi kalau ISSN gagal, dia pakai URL Sinta yang kamu input manual
        const sintaData = await fetchSintaData(jurnal.issn || '', jurnal.url_sinta);

        if (sintaData) {
            jurnal.akreditasi = sintaData.score;
            jurnal.sinta_id = sintaData.sintaId;
            jurnal.url_sinta = `https://sinta.kemdiktisaintek.go.id/journals/profile/${sintaData.sintaId}`;
            if (sintaData.garudaId) {
                jurnal.url_garuda = `https://garuda.kemdikbud.go.id/journal/view/${sintaData.garudaId}`;
            }
            await jurnal.save();
            return res.json({ message: 'Sync Sukses! Data Sinta & Garuda diperbarui.', data: sintaData });
        } else {
            jurnal.akreditasi = "Belum Terakreditasi";
            await jurnal.save();
            return res.status(200).json({ message: 'Tidak ditemukan di Sinta. Status: Belum Terakreditasi.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Gagal Sync: ' + err.message });
    }
};

module.exports = { getAllJurnals, createJurnal, updateJurnal, deleteJurnal, importExcel, syncSinta };