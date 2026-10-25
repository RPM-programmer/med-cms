const { DataTypes } = require('sequelize');
const path = require("path")
const { getSequelizeInstance } = require(path.join(__dirname, '..', 'config', 'db-init.js'));
const sequelize = getSequelizeInstance();
const Clinic = sequelize.define('Clinic', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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