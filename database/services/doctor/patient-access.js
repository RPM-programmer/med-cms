const path = require("path");
const User = require(path.join(__dirname, '..', '..', 'models', 'users'));
const Appointment = require(path.join(__dirname, '..', '..', 'models', 'appointments'));
const Disease = require(path.join(__dirname, '..', '..', 'models', 'diseases'));
const UserAddress = require(path.join(__dirname, '..', '..', 'models', 'user-addresses'));
const patientAccess = {
  async getHistory(patientId) {
    if (!patientId) {
      throw new Error('ID пациента не указан');
    }
    const patient = await User.findByPk(patientId, {
      attributes: ['id', 'fullName', 'email'],
      include: [
        { 
          model: UserAddress,
          attributes: ['city', 'street', 'houseNumber', 'assignedDistrict', 'assignedCabinet']
        },
        { 
          model: Appointment, 
          as: 'PatientAppointments',
          where: { status: 'завершен' },
          include: [{ model: Disease, attributes: ['name', 'code'] }],
          required: false
        }
      ],
      order: [[{ model: Appointment, as: 'PatientAppointments' }, 'date', 'DESC']]
    });
    if (!patient) {
      throw new Error('Пациент не найден в базе данных');
    }
    return patient;
  }
};
module.exports = patientAccess;