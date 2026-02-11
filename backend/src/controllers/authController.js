const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res) => {
    try {
        // Hapus 'email' dari sini, karena form Register.js cuma kirim username & password
        const { username, password } = req.body;
        
        // Ganti pengecekan dari 'email' menjadi 'username'
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: 'Username sudah terdaftar, silakan gunakan username lain.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        // Hapus 'email' saat create data baru
        await User.create({ username, password: hashedPassword });
        
        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body; 
        const user = await User.findOne({ where: { username } }); 
        
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password salah' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
        
        // Hapus 'email: user.email' dari respons balikan
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    register,
    login
};