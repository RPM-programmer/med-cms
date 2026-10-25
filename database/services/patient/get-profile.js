const path = require("path")
const User = require(path.join(__dirname, '..', '..', 'models', 'users'));
const UserAddress = require(path.join(__dirname, '..', '..', 'models', 'user-addresses'));
const Appointment = require(path.join(__dirname, '..', '..', 'models', 'appointments'));
const Disease = require(path.join(__dirname, '..', '..', 'models', 'diseases'));
const getProfile = {
  async getFullData(patientId) {
    if (!patientId) {
      throw new Error('ID пациента не указан');
    }
    const profile = await User.findByPk(patientId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserAddress,
          attributes: ['city', 'street', 'houseNumber', 'assignedDistrict', 'assignedCabinet']
        }
      ]
    });
    if (!profile) {
      throw new Error('Профиль пациента не найден в базе данных');
    }
    const appointments = await Appointment.findAll({
      where: { PatientId: patientId },
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['fullName', 'specialty']
        },
        {
          model: Disease,
          attributes: ['name', 'code', 'treatmentRecommendations', 'recommendedMedications']
        }
      ],
      order: [
        ['date', 'DESC'],
        ['time', 'DESC']
      ]
    });
    return {
      personalInfo: profile,
      medicalHistory: appointments
    };
  }
};
module.exports = getProfile;