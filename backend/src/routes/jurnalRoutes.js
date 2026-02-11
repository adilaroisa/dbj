const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const jurnalController = require('../controllers/jurnalController');

// Setup multer untuk route import (Simpan sementara di folder uploads/)
const upload = multer({ dest: 'uploads/' });

// --- DAFTAR ROUTES ---
// GET: Tidak perlu login (Bisa dilihat publik jika mau, atau tambah 'auth' kalau mau dilindungi)
router.get('/', jurnalController.getAllJurnals);

// POST/PUT/DELETE: Wajib Login (Pakai middleware 'auth')
router.post('/', auth, jurnalController.createJurnal);
router.put('/:id', auth, jurnalController.updateJurnal);
router.delete('/:id', auth, jurnalController.deleteJurnal);

// SPECIAL ROUTES
router.post('/import', auth, upload.single('file'), jurnalController.importExcel);
router.patch('/:id/sync-sinta', auth, jurnalController.syncSinta);

module.exports = router;