const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/db-init');

const sequelize = getSequelizeInstance();

const Clinic = sequelize.define('Clinic', {
  id: {
    type: DataTypes.INTEGER, // База данных сама будет ставить 1, 2, 3...
    autoIncrement: true,     // Включаем автоинкремент
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.ENUM('больница', 'поликлиника', 'станция скорой помощи', 'частный медицинский центр'), allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true }
}, { 
  timestamps: true 
});

module.exports = Clinic;
