const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Ambil token dari header Authorization (Format: Bearer <token>)
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    try {
        // Gunakan Secret dari .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Sesi habis atau token tidak valid.' });
    }
};

module.exports = auth;