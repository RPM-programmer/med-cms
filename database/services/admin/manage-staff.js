const User = require('../../models/users');
const Clinic = require('../../models/clinics');
const bcrypt = require('bcrypt');

const manageStaff = {
  async createAccount(staffData) {
    const { email, rawPassword, fullName, specialty } = staffData;
    // Принимаем ID клиники как простое число (1, 2, 3...)
    const ClinicId = staffData.ClinicId || staffData.clinicId;

    if (!email || !rawPassword || !fullName || !specialty || !ClinicId) {
      throw new Error('Необходимо заполнить все поля: email, rawPassword, fullName, specialty, clinicId');
    }

    // Проверяем, существует ли клиника с таким числовым ID (например, 1)
    const clinicExists = await Clinic.findByPk(ClinicId);
    if (!clinicExists) {
      throw new Error(`Больница с ID №${ClinicId} не найдена в системе. Сначала создайте клинику!`);
    }

    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Создаем врача в БД
    const newStaff = await User.create({
      email,
      password: hashedPassword,
      fullName,
      role: 'doctor', 
      specialty,
      ClinicId: Number(ClinicId), // Гарантируем, что передаем число
      isTemporaryPassword: true 
    });

    const result = newStaff.toJSON();
    delete result.password;
    return result;
  }
};

module.exports = manageStaff;
