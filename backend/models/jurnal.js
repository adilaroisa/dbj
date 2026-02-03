const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Jurnal = sequelize.define('Jurnal', {
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issn: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  url: {
    type: DataTypes.STRING, 
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
    allowNull: true 
  },
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
  timestamps: true 
});

module.exports = Jurnal;