const express = require('express');
const cors = require('cors');
// --- UPDATE PATH: Tambahkan './src/' di depan ---
const sequelize = require('./src/config/db'); 
const authRoutes = require('./src/routes/authRoutes');
const jurnalRoutes = require('./src/routes/jurnalRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jurnals', jurnalRoutes);

// Database Sync
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database terhubung & tersinkronisasi.');
    app.listen(5000, () => {
      console.log('Server berjalan di port 5000');
    });
  })
  .catch(err => console.log('Error DB:', err));