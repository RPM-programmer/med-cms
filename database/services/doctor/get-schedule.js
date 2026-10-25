const path = require("path")
const Appointment = require(path.join(__dirname, '..', '..', 'models', 'appointments'));
const User = require(path.join(__dirname, '..', '..', 'models', 'users'));
const getSchedule = {
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