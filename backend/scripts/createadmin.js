const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Pastikan path benar
const sequelize = require('../config/db');

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        await User.sync(); // Pastikan tabel ada

        // Cek admin lama
        const ada = await User.findOne({ where: { username: 'admin' } });
        if(ada) return console.log('Admin sudah ada!');

        // Buat admin baru: user=admin, pass=admin123
        const hash = await bcrypt.hash('admin123', 10);
        await User.create({ username: 'admin', password: hash });
        
        console.log('Sukses! Login pakai: admin / admin123');
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

createAdmin();