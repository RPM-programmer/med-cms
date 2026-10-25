const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/db-init');

const sequelize = getSequelizeInstance();

const Disease = sequelize.define('Disease', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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
    unique: true // Код по классификатору МКБ
  },
  treatmentRecommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendedMedications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Статистический счетчик заболеваемости по системе
  casesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Disease;
