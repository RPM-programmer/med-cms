const calcDistrict = require('./cals-district.js');
const getProfile = require('./get-profile');

const PatientService = {
  // Управление адресом и автоматический расчёт участков
  savePatientAddress: calcDistrict.saveAddress.bind(calcDistrict),
  
  // Выгрузка всей личной информации и истории болезни для пациента
  getFullMyData: getProfile.getFullData
};

module.exports = PatientService;
