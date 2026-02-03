const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Jurnal = sequelize.define('Jurnal', {
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // ISSN seharusnya ada, tapi kita buat optional dulu jika di Excel belum ada
  issn: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: { // Data Internal
    type: DataTypes.STRING,
    allowNull: true
  },
  kontak: { // Data Internal (No HP)
    type: DataTypes.STRING,
    allowNull: true
  },
  penerbit: { // Nama Kampus/Institusi
    type: DataTypes.STRING,
    allowNull: true
  },
  member_doi_rji: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  akreditasi: { // Misal: "SINTA 2"
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'jurnals'
});

module.exports = Jurnal;