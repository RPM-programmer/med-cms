const createClinic = require('./create-clinic');
const manageStaff = require('./manage-staff');
const dbAnalytics = require('./db-analytics');

const AdminService = {
  // Управление медицинскими учреждениями
  createClinic: createClinic.create,
  getAllClinics: createClinic.getAll,

  // Управление персоналом клиник
  createStaffAccount: manageStaff.createAccount,
  deleteAccount: manageStaff.deleteAccount,

  // Аналитические данные и таблицы БД
  getSystemStats: dbAnalytics.getStats
};

module.exports = AdminService;
