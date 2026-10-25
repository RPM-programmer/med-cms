const path = require("path")
const Appointment = require(path.join(__dirname, '..', '..', 'models', 'appointments'));
const User = require(path.join(__dirname, '..', '..', 'models', 'users'));
const bookAppointment = {
  async create(patientId, appointmentData) {
    const { doctorId, date, time } = appointmentData;
    if (!doctorId || !date || !time) {
      throw new Error('Необходимо выбрать врача, дату и время приема');
    }
    const doctor = await User.findOne({ where: { id: doctorId, role: 'doctor' } });
    if (!doctor) {
      throw new Error('Указанный врач не найден в системе или не имеет прав на прием');
    }
    const isSlotBusy = await Appointment.findOne({
      where: {
        DoctorId: doctorId,
        date: date,
        time: time,
        status: 'ожидается'
      }
    });
    if (isSlotBusy) {
      throw new Error(`Время ${time} на дату ${date} к врачу ${doctor.fullName} уже занято. Выберите другой слот.`);
    }
    const isPatientDoubleBooked = await Appointment.findOne({
      where: {
        PatientId: patientId,
        DoctorId: doctorId,
        date: date,
        status: 'ожидается'
      }
    });
    if (isPatientDoubleBooked) {
      throw new Error(`Вы уже записаны к врачу ${doctor.fullName} на дату ${date}. Нельзя бронировать несколько талонов на один день.`);
    }
    return await Appointment.create({
      date,
      time,
      status: 'ожидается',
      PatientId: patientId,
      DoctorId: doctorId
    });
  }
};
module.exports = bookAppointment;