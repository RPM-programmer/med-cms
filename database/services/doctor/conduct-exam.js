const Appointment = require('../../models/appointments');
const Disease = require('../../models/diseases');

const conductExam = {
  /**
   * Зафиксировать результаты осмотра пациента и закрыть прием
   */
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

    // Обновляем данные приема результатами осмотра
    appointment.complaints = complaints;
    appointment.objectively = objectively;
    appointment.doctorNotes = doctorNotes;
    appointment.status = 'завершен';

    if (diseaseId) {
      const disease = await Disease.findByPk(diseaseId);
      if (!disease) {
        throw new Error('Указанная болезнь не найдена в справочнике диагнозов');
      }
      
      // Привязываем болезнь к приему
      appointment.DiseaseId = diseaseId;

      // Автоматически обновляем статистику по этой болезни в БД (инкремент +1)
      await disease.increment('casesCount', { by: 1 });
    }

    await appointment.save();

    return appointment;
  }
};

module.exports = conductExam;
