const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/db-init');

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
    allowNull: false // Формат строки, например, "09:00"
  },
  status: {
    type: DataTypes.ENUM('ожидается', 'завершен', 'отменен'),
    defaultValue: 'ожидается',
    allowNull: false
  },
  // Результаты медицинского осмотра во время приема
  complaints: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  objectively: {
    type: DataTypes.TEXT,
    allowNull: true // Давление, пульс, общее состояние
  },
  doctorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Appointment;
