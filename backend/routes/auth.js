const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kunci Rahasia untuk Token (Bisa ganti sesuka hati)
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara_diy_2026';

// 1. REGISTER (DAFTAR)
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cek input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan Password wajib diisi!' });
        }

        // Cek apakah username sudah dipakai orang lain?
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username sudah terpakai, cari yang lain.' });
        }

        // Enkripsi Password biar aman
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan ke Database
        await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({ message: 'Registrasi Berhasil! Silakan Login.' });

    } catch (err) {
        res.status(500).json({ message: 'Error Server: ' + err.message });
    }
});

// 2. LOGIN (MASUK)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Cari User
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ message: 'Username tidak ditemukan' });

        // Cek Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password salah' });

        // Buat Token (Tiket Masuk)
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            message: 'Login Berhasil', 
            token, 
            user: { username: user.username } 
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;