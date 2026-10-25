const { DataTypes } = require('sequelize');
const path = require("path");
const { getSequelizeInstance } = require(path.join(__dirname, '..', 'config', 'db-init.js'));
const sequelize = getSequelizeInstance();
const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ожидается', 'завершен', 'отменен'),
    defaultValue: 'ожидается',
    allowNull: false
  },
  complaints: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  objectively: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  doctorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});
module.exports = Appointment;