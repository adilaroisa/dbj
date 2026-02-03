const express = require('express');
const router = express.Router();
const { getSintaData } = require('../utils/scraper');
// Asumsi kamu sudah buat model Jurnal di Sequelize
// const { Jurnal } = require('../models'); 

router.post('/sync-sinta/:issn', async (req, res) => {
    const { issn } = req.params;
    
    // 1. Jalankan Scraper
    const sintaResult = await getSintaData(issn);
    
    if (!sintaResult) {
        return res.status(500).json({ message: "Gagal mengambil data dari Sinta" });
    }

    // 2. Update ke Database (Contoh logika)
    // await Jurnal.update({ 
    //    sinta_score: sintaResult.score, 
    //    url_sinta: sintaResult.link 
    // }, { where: { issn } });

    res.json({
        message: "Sinkronisasi Berhasil",
        data: sintaResult
    });
});

module.exports = router;