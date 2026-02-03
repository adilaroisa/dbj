const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const Jurnal = require('./models/jurnal');
const { fetchSintaData } = require('./services/sintaService');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint Sync Sinta
app.post('/api/jurnal/sync/:issn', async (req, res) => {
    const { issn } = req.params;
    const result = await fetchSintaData(issn);
    
    if (result && result.sintaId) {
        await Jurnal.update(
            { sinta_score: result.score, sinta_id: result.sintaId },
            { where: { issn } }
        );
        return res.json({ message: "Sync Success", data: result });
    }
    res.status(404).json({ message: "Data not found" });
});

const PORT = 5000;
sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
});