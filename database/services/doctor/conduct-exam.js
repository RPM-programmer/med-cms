const path = require("path")
const Appointment = require(path.join(__dirname, '..', '..', 'models', 'appointments'));
const Disease = require(path.join(__dirname, '..', '..', 'models', 'diseases'));
const conductExam = {
  async saveResult(examData) {
    const { appointmentId, complaints, objectively, doctorNotes, diseaseId } = examData;
    if (!appointmentId) {
      throw new Error('ID приема обязателен для сохранения результатов');
    }
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new Error('Указанный прием не найден');
    }
    if (appointment.status === 'завершен') {
      throw new Error('Этот прием уже был успешно завершен ранее');
    }
    appointment.complaints = complaints;
    appointment.objectively = objectively;
    appointment.doctorNotes = doctorNotes;
    appointment.status = 'завершен';
    if (diseaseId) {
      const disease = await Disease.findByPk(diseaseId);
      if (!disease) {
        throw new Error('Указанная болезнь не найдена в справочнике диагнозов');
      }
      appointment.DiseaseId = diseaseId;
      await disease.increment('casesCount', { by: 1 });
    }
    await appointment.save();
    return appointment;
  }
};
module.exports = conductExam;