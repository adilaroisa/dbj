const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const fetchSintaData = async (issn) => {
    try {
        const cleanIssn = issn.replace(/[^0-9]/g, '');
        
        // Panggil langsung dari .env
        // Kita buat fallback ke domain publik jika variabel env tidak terbaca
        const baseUrl = process.env.SINTA_BASE_URL;
        
        // Sesuai flow: Cari lewat query ISSN
        const searchUrl = `${baseUrl}/journals?q=${cleanIssn}`;

        console.log(`Menghubungi: ${searchUrl}`);

        const { data } = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' 
            },
            timeout: 10000 
        });

        const $ = cheerio.load(data);
        
        // Flow: Cari elemen profil pertama
        const firstResult = $('a[href*="/journals/profile/"]').first();
        
        if (firstResult.length === 0) {
            return { akreditasi: "Belum Terakreditasi", sinta_id: null, url_sinta: null };
        }

        const profilePath = firstResult.attr('href'); // e.g. /journals/profile/643
        const sintaId = profilePath.split('/').pop();
        const fullProfileUrl = profilePath.startsWith('http') ? profilePath : `${baseUrl}${profilePath}`;
        
        // Ambil Skor Sinta (S1-S6)
        const scoreText = firstResult.text().trim();
        const scoreMatch = scoreText.match(/S([1-6])/);
        const finalScore = scoreMatch ? `Sinta ${scoreMatch[1]}` : "Belum Terakreditasi";

        return {
            akreditasi: finalScore,
            sinta_id: sintaId,
            url_sinta: fullProfileUrl
        };
    } catch (error) {
        console.error("Gagal sinkronisasi Sinta:", error.message);
        throw error;
    }
};

module.exports = { fetchSintaData };