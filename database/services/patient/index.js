const calcDistrict = require('./calc-district');
const getProfile = require('./get-profile');
const bookAppointment = require('./book-appointment'); // Подключаем

const PatientService = {
  savePatientAddress: calcDistrict.saveAddress.bind(calcDistrict),
  getFullMyData: getProfile.getFullData,
  bookAppointment: bookAppointment.create.bind(bookAppointment) // Экспортируем
};

module.exports = PatientService;
