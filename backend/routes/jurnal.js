const express = require('express');
const router = express.Router(); 
const Jurnal = require('../models/jurnal');
const { fetchSintaData } = require('../services/SintaServices');

// Endpoint Sinkronisasi otomatis sesuai Flowchart
router.patch('/:id/sync-sinta', async (req, res) => {
    try {
        const jurnal = await Jurnal.findByPk(req.params.id);
        if (!jurnal || !jurnal.issn) {
            return res.status(400).json({ message: 'Jurnal tidak ditemukan atau ISSN kosong' });
        }

        const sintaInfo = await fetchSintaData(jurnal.issn);

        if (sintaInfo) {
            // Update data sesuai hasil discovery
            await jurnal.update({
                akreditasi: sintaInfo.akreditasi,
                sinta_id: sintaInfo.sinta_id, // Pastikan kolom ini ada di model
                url_sinta: sintaInfo.url_sinta
            });
            res.json({ message: 'Data Sinta berhasil diperbarui', data: jurnal });
        } else {
            res.status(404).json({ message: 'Data tidak ditemukan di portal Sinta' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;