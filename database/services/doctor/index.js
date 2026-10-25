const getSchedule = require('./get-schedule');
const patientAccess = require('./patient-access');
const conductExam = require('./conduct-exam');

const DoctorService = {
  // Расписание приемов врача
  getMySchedule: getSchedule.byDoctorId,

  // Медицинская история пациентов
  getPatientHistory: patientAccess.getHistory,

  // Проведение и фиксация результатов осмотра
  saveExamination: conductExam.saveResult
};

module.exports = DoctorService;
