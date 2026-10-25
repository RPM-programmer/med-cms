const Appointment = require('../../models/appointments');
const User = require('../../models/users');

const getSchedule = {
  /**
   * Получить список ожидающих пациентов для конкретного врача
   */
  async byDoctorId(doctorId) {
    if (!doctorId) {
      throw new Error('ID врача не указан');
    }

    return await Appointment.findAll({
      where: { 
        DoctorId: doctorId, 
        status: 'ожидается' 
      },
      include: [{ 
        model: User, 
        as: 'Patient', 
        attributes: ['id', 'fullName', 'email'] 
      }],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
  }
};

module.exports = getSchedule;
