const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Jurnal = sequelize.define('Jurnal', {
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issn: {
    type: DataTypes.STRING,
    allowNull: true // Sesuai flow: Admin bisa input nama dulu baru cari ISSN kemudian
  },
  url: {
    type: DataTypes.STRING, // URL Jurnal asli
    allowNull: true
  },
  email: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  kontak: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  penerbit: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  member_doi_rji: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  akreditasi: { 
    type: DataTypes.STRING,
    allowNull: true // Akan terisi otomatis oleh SintaServices: "SINTA 2" atau "Belum Terakreditasi"
  },
  // Tambahan untuk menyimpan hasil Scrapping agar link tetap valid
  sinta_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url_sinta: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'jurnals',
  timestamps: true // Bagus untuk tahu kapan terakhir data Sinta di-update
});

module.exports = Jurnal;