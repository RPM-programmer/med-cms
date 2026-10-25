const path = require("path")
const User = require(path.join(__dirname, '..', '..', 'models', 'users'));
const Clinic = require(path.join(__dirname, '..', '..', 'models', 'clinics'));
const Disease = require(path.join(__dirname, '..', '..', 'models', 'diseases'));
const Appointment = require(path.join(__dirname, '..', '..', 'models', 'appointments'));
const dbAnalytics = {
  async getStats() {
    const totalClinics = await Clinic.count();
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalStaff = await User.count({ where: { role: 'doctor' } });
    const totalAppointments = await Appointment.count();
    const topDiseases = await Disease.findAll({
      limit: 5,
      order: [['casesCount', 'DESC']],
      attributes: ['name', 'code', 'casesCount']
    });
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