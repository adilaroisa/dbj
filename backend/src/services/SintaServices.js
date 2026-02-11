const axios = require('axios');

/**
 * Service untuk mengambil data Akreditasi Sinta berdasarkan ISSN
 * URL Target: https://sinta.kemdiktisaintek.go.id/journals/profile/[ID]
 * Karena Sinta sering ganti URL & API sulit diakses langsung tanpa scraping berat,
 * Kita buat simulasi logic dulu (Mocking) agar flow aplikasi jalan.
 * Nanti bisa diganti dengan Puppeteer/Cheerio beneran.
 */

async function fetchSintaData(issn) {
    console.log(`[SintaService] Mencari data untuk ISSN: ${issn}`);
    const cleanIssn = issn.replace(/-/g, '').trim();
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // --- LOGIKA MOCKUP (SEMENTARA) ---
        // Di real-world, di sini kita akan scraping ke web Sinta
        // Tapi karena ini rawan error blokir, kita simulasi keberhasilan dulu
        // agar fitur Dashboard bisa dites oleh Admin.
        
        // Skenario 1: Jika ISSN genap -> Anggap Ketemu (Sinta 2)
        // Skenario 2: Jika ISSN ganjil -> Anggap Ketemu (Sinta 4)
        // Skenario 3: Jika ISSN '00000000' -> Tidak Ditemukan
        
        const lastDigit = parseInt(cleanIssn.slice(-1));
        
        if (cleanIssn === '00000000') return null; // Tidak ketemu

        let score = 'S3'; // Default
        if (lastDigit % 2 === 0) score = 'S2';
        else score = 'S4';

        // Generate Random ID untuk Sinta & Garuda
        const sintaId = Math.floor(Math.random() * 10000) + 1000;
        const garudaId = Math.floor(Math.random() * 100000) + 10000;

        // Return Data Format
        return {
            issn: cleanIssn,
            score: score, 
            sintaId: sintaId.toString(),
            garudaId: garudaId.toString()
        };

    } catch (error) {
        console.error('[SintaService Error]', error.message);
        return null;
    }
}

module.exports = { fetchSintaData };