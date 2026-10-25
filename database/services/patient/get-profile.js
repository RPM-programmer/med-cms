const User = require('../../models/users');
const UserAddress = require('../../models/user-addresses');
const Appointment = require('../../models/appointments');
const Disease = require('../../models/diseases');

const getProfile = {
  /**
   * Собрать полное медицинское досье пациента для личного кабинета
   */
  async getFullData(patientId) {
    if (!patientId) {
      throw new Error('ID пациента не указан');
    }

    // 1. Ищем базовый профиль пользователя (исключаем пароль ради безопасности)
    const profile = await User.findByPk(patientId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserAddress,
          attributes: ['city', 'street', 'houseNumber', 'assignedDistrict', 'assignedCabinet']
        }
      ]
    });

    // ИСПРАВЛЕНО: Корректная проверка на существование профиля
    if (!profile) {
      throw new Error('Профиль пациента не найден в базе данных');
    }

    // 2. Вытягиваем всю историю приёмов (прошлых и будущих) со связанными врачами и диагнозами
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

    // Формируем единый структурированный объект "информации о себе"
    return {
      personalInfo: profile,
      medicalHistory: appointments
    };
  }
};

module.exports = getProfile;
