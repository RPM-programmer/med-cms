const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

function getSequelizeInstance(dbPath) {
  if (!sequelize) {
    const storagePath = dbPath || path.join(process.cwd(), 'med-cms.sqlite');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: storagePath,
      logging: false
    });
  }
  return sequelize;
}

async function initDatabase(dbPath) {
  const instance = getSequelizeInstance(dbPath);

  try {
    await instance.authenticate();
    console.log('✅ [Med Module] Успешное подключение к SQLite через Sequelize.');

    // Импортируем модели
    const Clinic = require('../models/clinics');
    const User = require('../models/users');
    const UserAddress = require('../models/user-addresses');
    const Disease = require('../models/diseases');
    const Appointment = require('../models/appointments');

    // Настройка связей
    User.belongsTo(Clinic, { foreignKey: 'ClinicId', onDelete: 'SET NULL' });
    Clinic.hasMany(User, { foreignKey: 'ClinicId' });

    UserAddress.belongsTo(User, { foreignKey: 'UserId', onDelete: 'CASCADE' });
    User.hasOne(UserAddress, { foreignKey: 'UserId' });

    Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'PatientId', onDelete: 'CASCADE' });
    Appointment.belongsTo(User, { as: 'Doctor', foreignKey: 'DoctorId', onDelete: 'CASCADE' });
    Appointment.belongsTo(Disease, { foreignKey: 'DiseaseId', onDelete: 'SET NULL' });

    // Синхронизируем чистые таблицы БЕЗ встроенных сидов
    await instance.sync({ alter: true });
    console.log('✅ [Med Module] Все таблицы базы данных успешно синхронизированы.');

  } catch (error) {
    console.error('❌ [Med Module] Ошибка инициализации базы данных:', error);
    throw error;
  }
}

module.exports = {
  get sequelize() { return sequelize; },
  getSequelizeInstance,
  initDatabase
};
