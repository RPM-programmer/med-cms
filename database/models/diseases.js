const { DataTypes } = require('sequelize');
const path = require("path");
const { getSequelizeInstance } = require(path.join(__dirname, '..', 'config', 'db-init.js'));
const sequelize = getSequelizeInstance();
const Disease = sequelize.define('Disease', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
    unique: true
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