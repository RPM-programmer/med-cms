const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
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
    console.log(logger.DatabaseMedInfo("Успешное подключение к SQLite через Sequelize."));

    // 1. Импортируем функции моделей и сразу инициализируем их инстансом sequelize
    const models = {
      Clinic: require(path.join(__dirname, '..', 'models', 'clinics'))(instance, DataTypes),
      User: require(path.join(__dirname, '..', 'models', 'users'))(instance, DataTypes),
      UserAddress: require(path.join(__dirname, '..', 'models', 'user-addresses'))(instance, DataTypes),
      Disease: require(path.join(__dirname, '..', 'models', 'diseases'))(instance, DataTypes),
      Appointment: require(path.join(__dirname, '..', 'models', 'appointments'))(instance, DataTypes)
    };

    // 2. Автоматически запускаем связи, которые мы прописали внутри файлов таблиц
    Object.keys(models).forEach((modelName) => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    await instance.sync({ alter: true });
    console.log(logger.DatabaseMedInfo("Все таблицы базы данных успешно синхронизированы."));
  } catch (error) {
    console.log(logger.DatabaseMedError('Ошибка инициализации базы данных:', error));
    throw error;
  }
}

// В самом конце вашего database/config/db-init.js вместо старого exports:

const db = {
  getSequelizeInstance,
  initDatabase,
  get sequelize() { return sequelize; },
  // Динамически прокидываем модели наружу, чтобы они были доступны как db.User, db.Clinic и т.д.
  models: {} 
};

// Перепишем функцию initDatabase, чтобы она сохраняла модели в db.models и самом объекте db
async function initDatabase(dbPath) {
  const instance = getSequelizeInstance(dbPath);
  
  try {
    await instance.authenticate();
    console.log(logger.DatabaseMedInfo("Успешное подключение к SQLite через Sequelize."));

    // Инициализируем и сохраняем в объект
    db.models.Clinic = db.Clinic = require(path.join(__dirname, '..', 'models', 'clinics'))(instance, DataTypes);
    db.models.User = db.User = require(path.join(__dirname, '..', 'models', 'users'))(instance, DataTypes);
    db.models.UserAddress = db.UserAddress = require(path.join(__dirname, '..', 'models', 'user-addresses'))(instance, DataTypes);
    db.models.Disease = db.Disease = require(path.join(__dirname, '..', 'models', 'diseases'))(instance, DataTypes);
    db.models.Appointment = db.Appointment = require(path.join(__dirname, '..', 'models', 'appointments'))(instance, DataTypes);

    // Запускаем связи
    Object.keys(db.models).forEach((modelName) => {
      if (db.models[modelName].associate) {
        db.models[modelName].associate(db.models);
      }
    });

    await instance.sync({ alter: true });
    console.log(logger.DatabaseMedInfo("Все таблицы базы данных успешно синхронизированы."));
  } catch (error) {
    console.log(logger.DatabaseMedError('Ошибка инициализации базы данных:', error));
    throw error;
  }
}

module.exports = db;
