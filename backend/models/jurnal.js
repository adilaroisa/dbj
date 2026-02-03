const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Jurnal = sequelize.define('Jurnal', {
    nama: { type: DataTypes.STRING, allowNull: false },
    issn: { type: DataTypes.STRING, primaryKey: true },
    univ: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    tlpn: { type: DataTypes.STRING },
    sinta_score: { type: DataTypes.STRING, defaultValue: "N/A" },
    sinta_id: { type: DataTypes.STRING, allowNull: true } 
}, {
    tableName: 'jurnals',
    timestamps: true
});

module.exports = Jurnal;