const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const fetchSintaData = async (issn) => {
    try {
        const cleanIssn = issn.replace(/-/g, '');
        const searchUrl = `${process.env.SINTA_DOMAIN}/journals?q=${cleanIssn}`;

        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0' }
        });

        const $ = cheerio.load(data);
        const firstResult = $('.filter-item a').first();
        
        // Hanya mengambil ID unik, bukan link utuh
        const href = firstResult.attr('href'); 
        const sintaId = href ? href.split('=')[1] : null;

        return {
            score: firstResult.text().trim() || "N/A",
            sintaId: sintaId
        };
    } catch (error) {
        console.error("Scraping failed:", error.message);
        return null;
    }
};

module.exports = { fetchSintaData };