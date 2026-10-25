const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require(path.join(__dirname, '..', 'database', 'models', 'users'));
const Disease = require(path.join(__dirname, '..', 'database', 'models', 'diseases'));
const createMiddleware = require(path.join(__dirname, 'midleware'));
const { MED_PERMISSIONS } = require(path.join(__dirname, 'permissions'));
const AdminService = require(path.join(__dirname, '..', 'database', 'services', 'admin'));
const DoctorService = require(path.join(__dirname, '..', 'database', 'services', 'doctor'));
const PatientService = require(path.join(__dirname, '..', 'database', 'services', 'patient'));
function createMedRouter(jwtSecret) {
  const api = express.Router();
  const web = express.Router();
  web.use("/", express.static(path.join(__dirname, "..", "public")));
  const { verifyCookie, requireRole, checkPermission } = createMiddleware(jwtSecret);
  api.post('/auth/register', async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || !fullName) throw new Error('Заполните обязательные поля: email, password, fullName');
      const candidate = await User.findOne({ where: { email } });
      if (candidate) return res.status(400).json({ success: false, message: 'Email уже занят' });
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword, fullName, role: 'patient' });
      res.status(201).json({ success: true, message: 'Регистрация успешна' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  api.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ success: false, message: 'Неверный логин или пароль' });
      }
      const token = jwt.sign(
        { id: user.id, role: user.role, specialty: user.specialty },
        jwtSecret,
        { expiresIn: '7d' }
      );
      res.cookie('med_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
      res.json({ success: true, user: { id: user.id, fullName: user.fullName, role: user.role } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  api.post('/auth/logout', (req, res) => {
    res.clearCookie('med_auth_token');
    res.json({ success: true, message: 'Успешный выход' });
  });
  web.get('/med-patient', verifyCookie, requireRole(['patient']), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'dashboard-patient.html'));
  });
  api.get('/patient/me', verifyCookie, async (req, res) => {
    try {
      const fullData = await PatientService.getFullMyData(req.user.id);
      res.json({ success: true, data: fullData });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  api.post('/patient/address', verifyCookie, async (req, res) => {
    try {
      const updatedAddress = await PatientService.savePatientAddress(req.user.id, req.body);
      res.json({ success: true, address: updatedAddress });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  web.get('/med-doctor', verifyCookie, requireRole(['doctor']), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'dashboard-doctor.html'));
  });
  api.get('/doctor/schedule', verifyCookie, requireRole(['doctor']), async (req, res) => {
    try {
      const schedule = await DoctorService.getMySchedule(req.user.id);
      res.json({ success: true, schedule });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  api.get('/doctor/patient-history/:id', verifyCookie, requireRole(['doctor']), async (req, res) => {
    try {
      const history = await DoctorService.getPatientHistory(req.params.id);
      res.json({ success: true, history });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });
  api.post('/doctor/complete-examination', verifyCookie, requireRole(['doctor']), async (req, res) => {
    try {
      const result = await DoctorService.saveExamination(req.body);
      res.json({ success: true, appointment: result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  api.post('/doctor/schedule-surgery', verifyCookie, requireRole(['doctor']), checkPermission(MED_PERMISSIONS.SCHEDULE_SURGERY), (req, res) => {
    res.json({ success: true, message: 'Операция успешно добавлена в график хирургического отделения.' });
  });
  web.get('/med-admin', verifyCookie, requireRole(['admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'dashboard-admin.html'));
  });
  api.post('/admin/clinics', verifyCookie, requireRole(['admin']), async (req, res) => {
    try {
      const newClinic = await AdminService.createClinic(req.body);
      res.status(201).json({ success: true, data: newClinic });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  api.post('/admin/staff', verifyCookie, requireRole(['admin']), async (req, res) => {
    try {
      if (req.body.clinicId && !req.body.ClinicId) {
        req.body.ClinicId = req.body.clinicId;
      }

      const staffUser = await AdminService.createStaffAccount(req.body);
      res.status(201).json({ success: true, data: staffUser });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  api.delete('/admin/users/:id', verifyCookie, requireRole(['admin']), async (req, res) => {
    try {
      const result = await AdminService.deleteAccount(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  api.get('/admin/stats', verifyCookie, requireRole(['admin']), async (req, res) => {
    try {
      const stats = await AdminService.getSystemStats();
      res.json({ success: true, stats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  api.get('/admin/list-clinics', verifyCookie, requireRole(['admin']), async (req, res) => {
  try {
    const Clinic = require('../database/models/clinics');
    const clinics = await Clinic.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: clinics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
api.get('/admin/list-staff', verifyCookie, requireRole(['admin']), async (req, res) => {
  try {
    const User = require('../database/models/users');
    const Clinic = require('../database/models/clinics');
    const staff = await User.findAll({
      where: { role: 'doctor' },
      include: [{ model: Clinic, attributes: ['name'] }],
      order: [['fullName', 'ASC']]
    });
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
  // 1. Получить список всех доступных врачей для записи (Публично для пациентов)
  api.get('/patient/doctors-list', verifyCookie, requireRole(['patient']), async (req, res) => {
    try {
      const User = require('../database/models/users');
      const Clinic = require('../database/models/clinics');
      
      const doctors = await User.findAll({
        where: { role: 'doctor' },
        attributes: ['id', 'fullName', 'specialty'],
        include: [{ model: Clinic, attributes: ['name', 'address'] }]
      });
      res.json({ success: true, data: doctors });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Создать новую запись на прием (Бронирование талона)
  api.post('/patient/book', verifyCookie, requireRole(['patient']), async (req, res) => {
    try {
      // ID пациента безопасно берем из расшифрованной HttpOnly-куки (req.user.id)
      const patientId = req.user.id;
      
      const appointment = await PatientService.bookAppointment(patientId, req.body);
      res.status(212).json({ success: true, data: appointment });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  // ИСПРАВЛЕНИЕ: Добавляем 'admin' в requireRole, чтобы при тесте под админом справочник подгружался!
  api.get('/doctor/diseases-list', verifyCookie, requireRole(['doctor', 'admin']), async (req, res) => {
    try {
      const Disease = require('../database/models/diseases');
      const diseases = await Disease.findAll({ order: [['name', 'ASC']] });
      res.json({ success: true, data: diseases });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  // API Смены пароля для любого авторизованного пользователя (Врач, Пациент, Админ)
  api.post('/auth/change-password', verifyCookie, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id; // Берем ID строго из HttpOnly куки

      if (!oldPassword || !newPassword) {
        throw new Error('Необходимо указать старый и новый пароли');
      }

      // Ищем пользователя в базе
      const user = await User.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');

      // Сверяем старый пароль с хешем в БД
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Старый пароль введен неверно' });
      }

      // Хешируем новый пароль перед записью в SQLite
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Обновляем пароль и снимаем флаг временного пароля
      await user.update({
        password: hashedNewPassword,
        isTemporaryPassword: false
      });
      res.json({ success: true, message: 'Пароль успешно изменен' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Обновим также роут выгрузки расписания, чтобы он отдавал данные о вошедшем враче для шапки кабинета
  api.get('/doctor/me', verifyCookie, requireRole(['doctor']), async (req, res) => {
    try {
      const doctorData = await User.findByPk(req.user.id, { attributes: ['fullName', 'position', 'specialty'] });
      res.json({ success: true, doctor: doctorData });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  return {web:web, api:api};
}

module.exports = createMedRouter;
