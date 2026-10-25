const Appointment = require('../../models/appointments');
const User = require('../../models/users');

const bookAppointment = {
  /**
   * Записать пациента к конкретному врачу на свободное время
   */
  async create(patientId, appointmentData) {
    const { doctorId, date, time } = appointmentData;

    if (!doctorId || !date || !time) {
      throw new Error('Необходимо выбрать врача, дату и время приема');
    }

    // 1. Проверяем, существует ли такой врач и активен ли его аккаунт
    const doctor = await User.findOne({ where: { id: doctorId, role: 'doctor' } });
    if (!doctor) {
      throw new Error('Указанный врач не найден в системе или не имеет прав на прием');
    }

    // 2. Проверяем, не занят ли уже этот слот (этот врач на это время и дату)
    const isSlotBusy = await Appointment.findOne({
      where: {
        DoctorId: doctorId,
        date: date,
        time: time,
        status: 'ожидается' // Проверяем только активные записи
      }
    });

    if (isSlotBusy) {
      throw new Error(`Время ${time} на дату ${date} к врачу ${doctor.fullName} уже занято. Выберите другой слот.`);
    }

    // 3. Проверяем, не записан ли сам пациент уже к ЭТОМУ ЖЕ врачу на ЭТУ ЖЕ дату (защита от спама)
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

    // 4. Создаем запись приема в SQLite
    return await Appointment.create({
      date,
      time,
      status: 'ожидается',
      PatientId: patientId, // ID вошедшего пациента из куки
      DoctorId: doctorId    // ID выбранного врача
    });
  }
};

module.exports = bookAppointment;
