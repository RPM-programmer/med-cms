const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/db-init');

const sequelize = getSequelizeInstance();

const Disease = sequelize.define('Disease', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // База данных сама ставит 1, 2, 3...
    primaryKey: true
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  code: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true // Код МКБ-10
  },
  treatmentRecommendations: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  recommendedMedications: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  casesCount: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0, 
    allowNull: false 
  }
}, {
  timestamps: true
});

module.exports = Disease;
