const User = require('../../models/users');
const Clinic = require('../../models/clinics');
const Disease = require('../../models/diseases');
const Appointment = require('../../models/appointments');

const dbAnalytics = {
  /**
   * Собрать общую медицинскую статистику и сгенерировать данные для дашборда таблицы
   */
  async getStats() {
    const totalClinics = await Clinic.count();
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalStaff = await User.count({ where: { role: 'doctor' } });
    const totalAppointments = await Appointment.count();

    // Топ-5 самых частых болезней на основе инкрементируемого счетчика в системе
    const topDiseases = await Disease.findAll({
      limit: 5,
      order: [['casesCount', 'DESC']],
      attributes: ['name', 'code', 'casesCount']
    });

    // Разбивка медицинского персонала по специальностям (для графиков или таблиц админа)
    const staffBySpecialty = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['specialty', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
      group: ['specialty']
    });

    return {
      summary: {
        totalClinics,
        totalPatients,
        totalStaff,
        totalAppointments
      },
      topDiseases,
      staffBySpecialty
    };
  }
};

module.exports = dbAnalytics;
