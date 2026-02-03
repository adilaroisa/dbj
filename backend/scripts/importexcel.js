const path = require('path');
const xlsx = require('xlsx');
const Jurnal = require('../models/jurnal'); // Pastikan 'j' kecil
const sequelize = require('../config/db');

// Ganti nama file ini sesuai nama file Excel yang Anda taruh di folder backend
const EXCEL_FILENAME = 'Database Jurnal D.I. Yogyakarta.xlsx'; 

const importData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        
        // Sinkronisasi tabel (Hati-hati: alter=true akan menyesuaikan kolom tapi data aman)
        await Jurnal.sync({ alter: true });

        const filePath = path.join(__dirname, '..', EXCEL_FILENAME);
        console.log(`Membaca file: ${filePath}`);

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Ambil sheet pertama
        const sheet = workbook.Sheets[sheetName];
        
        // Konversi Excel ke JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`Ditemukan ${data.length} baris data. Mulai import...`);

        let successCount = 0;
        let failCount = 0;

        for (const row of data) {
            try {
                // Mapping kolom Excel ke Database
                // Pastikan nama key (sebelah kiri) SAMA PERSIS dengan header di Excel Anda
                await Jurnal.create({
                    nama: row['Nama Jurnal'],
                    univ: row['Penerbit'],
                    email: row['Email'],
                    tlpn: row['Kontak'], // Pastikan formatnya teks di excel agar 08... tidak hilang
                    url: row['URL'],
                    sinta_score: row['Akreditasi'],
                    // issn: row['ISSN'] // Aktifkan ini nanti kalau Excel sudah ada kolom ISSN
                });
                successCount++;
            } catch (err) {
                console.error(`Gagal import baris: ${row['Nama Jurnal']} - Error: ${err.message}`);
                failCount++;
            }
        }

        console.log(`\nSelesai!`);
        console.log(`Berhasil: ${successCount}`);
        console.log(`Gagal: ${failCount}`);

    } catch (error) {
        console.error('Error Utama:', error);
    } finally {
        await sequelize.close();
    }
};

importData();