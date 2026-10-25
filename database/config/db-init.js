const { Sequelize } = require('sequelize');
const path = require('path');
const Clinic = require(path.join(__dirname, '..', 'models', 'clinics'));
const User = require(path.join(__dirname, '..', 'models', 'users'));
const UserAddress = require(path.join(__dirname, '..', 'models', 'user-addresses'));
const Disease = require(path.join(__dirname, '..', 'models', 'diseases'));
const Appointment = require(path.join(__dirname, '..', 'models', 'appointments'));
const logger = require("custom-color-logs").print;
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
    console.log(logger.DatabaseMedInfo("Успешное подключение к SQLite через Sequelize."))
    User.belongsTo(Clinic, { foreignKey: 'ClinicId', onDelete: 'SET NULL' });
    Clinic.hasMany(User, { foreignKey: 'ClinicId' });
    UserAddress.belongsTo(User, { foreignKey: 'UserId', onDelete: 'CASCADE' });
    User.hasOne(UserAddress, { foreignKey: 'UserId' });
    Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'PatientId', onDelete: 'CASCADE' });
    Appointment.belongsTo(User, { as: 'Doctor', foreignKey: 'DoctorId', onDelete: 'CASCADE' });
    Appointment.belongsTo(Disease, { foreignKey: 'DiseaseId', onDelete: 'SET NULL' });
    await instance.sync({ alter: true });
    console.log(logger.DatabaseMedInfo("Все таблицы базы данных успешно синхронизированы."))
  } catch (error) {
    console.log(logger.DatabaseMedError('Ошибка инициализации базы данных:', error))
    throw error;
  }
}
module.exports = {
  get sequelize() { return sequelize; },
  getSequelizeInstance,
  initDatabase
};