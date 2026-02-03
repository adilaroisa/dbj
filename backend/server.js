const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const jurnalRoutes = require('./routes/jurnal');
const authRoutes = require('./routes/auth'); // Import rute login
const User = require('./models/user'); // Pastikan model user dimuat untuk sinkronisasi tabel

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Endpoint Auth (Login)
app.use('/api/auth', authRoutes);

// Endpoint Jurnal (CRUD & Sync Sinta)
// Semua logika jurnal (termasuk sync) sebaiknya ada di dalam jurnalRoutes agar rapi
app.use('/api/jurnal', jurnalRoutes); 

const PORT = process.env.PORT || 5000;

// Sinkronisasi Database & Start Server
// alter: true berguna agar jika ada perubahan kolom (misal nambah sinta_id), tabel otomatis update tanpa hapus data
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database & Tables Synced!');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });