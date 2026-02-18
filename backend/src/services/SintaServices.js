const axios = require('axios');
const cheerio = require('cheerio');

const fetchSintaData = async (issn, manualUrl = null) => {
    // A. JIKA ADA URL MANUAL (Prioritas Utama)
    // Ini menangani kasus "Jurnal ada tapi tidak muncul di pencarian"
    if (manualUrl && manualUrl.includes('/journals/profile/')) {
        console.log(`[SintaService] Menggunakan URL Manual: ${manualUrl}`);
        try {
            const response = await axios.get(manualUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Compatible; Scraper/1.0)' },
                validateStatus: status => status < 500
            });
            const $ = cheerio.load(response.data);
            return parseProfilePage($, manualUrl); // Langsung baca profil
        } catch (error) {
            console.error("[SintaService] Gagal akses URL Manual:", error.message);
            // Lanjut ke cara B jika manual gagal
        }
    }

    // B. CARA LAMA (Cari via ISSN)
    const cleanIssn = issn.replace(/[^0-9]/g, ''); 
    const searchUrl = `https://sinta.kemdiktisaintek.go.id/journals/index/?q=${cleanIssn}`;
    
    console.log(`[SintaService] Searching ISSN: ${searchUrl}`);

    try {
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Compatible; Scraper/1.0)' },
            maxRedirects: 5,
            validateStatus: status => status < 500
        });

        const $ = cheerio.load(response.data);
        const finalUrl = response.request.res.responseUrl || searchUrl;

        // KASUS 1: Langsung Redirect ke Profil
        if (finalUrl.includes('/journals/profile/')) {
            return parseProfilePage($, finalUrl);
        }

        // KASUS 2: Masih di Halaman List
        return parseListPage($, cleanIssn);

    } catch (error) {
        console.error("[SintaService] Error:", error.message);
        return null;
    }
};

// --- LOGIKA BACA HALAMAN PROFIL ---
const parseProfilePage = ($, url) => {
    try {
        const parts = url.split('/');
        const sintaId = parts[parts.length - 1];

        // Ambil Score Sinta
        let score = "Belum Terakreditasi";
        const badgeSrc = $('img[src*="/assets/img/sinta/"]').attr('src');
        if (badgeSrc) {
            const match = badgeSrc.match(/sinta(\d)/i);
            if (match) score = `Sinta ${match[1]}`;
        } else {
            // Fallback Teks
            const statText = $('.uk-text-uppercase').text();
            if (statText.includes('S1')) score = 'Sinta 1';
            else if (statText.includes('S2')) score = 'Sinta 2';
            else if (statText.includes('S3')) score = 'Sinta 3';
            else if (statText.includes('S4')) score = 'Sinta 4';
            else if (statText.includes('S5')) score = 'Sinta 5';
            else if (statText.includes('S6')) score = 'Sinta 6';
        }

        // Ambil Garuda ID
        const garudaLink = $('a[href*="garuda.kemdikbud.go.id"]').attr('href');
        let garudaId = null;
        if (garudaLink) {
            const gParts = garudaLink.split('/');
            garudaId = gParts[gParts.length - 1];
        }

        return { sintaId, score, garudaId };

    } catch (e) {
        console.error("[SintaService] Parse Profile Error:", e.message);
        return null;
    }
};

// --- LOGIKA BACA LIST PENCARIAN ---
const parseListPage = ($, queryIssn) => {
    let result = null;
    $('.uk-card').each((i, el) => {
        const text = $(el).text().replace(/[^0-9]/g, '');
        if (text.includes(queryIssn)) {
            const link = $(el).find('a[href*="/journals/profile/"]').attr('href');
            if (link) {
                const parts = link.split('/');
                const sintaId = parts[parts.length - 1];
                
                let score = "Belum Terakreditasi";
                const img = $(el).find('img[src*="sinta"]').attr('src');
                if (img) {
                    const match = img.match(/sinta(\d)/i);
                    if (match) score = `Sinta ${match[1]}`;
                }
                result = { sintaId, score, garudaId: null }; 
                return false; 
            }
        }
    });
    return result;
};

module.exports = { fetchSintaData };