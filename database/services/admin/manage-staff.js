const path = require("path")
const User = require(path.join(__dirname, '..', '..', 'models', 'users'));
const Clinic = require(path.join(__dirname, '..', '..', 'models', 'clinics'));
const bcrypt = require('bcrypt');
const manageStaff = {
    async createAccount(staffData) {
    const { email, rawPassword, fullName, medicalProfile } = staffData;
    const ClinicId = staffData.ClinicId || staffData.clinicId;
    if (!email || !rawPassword || !fullName || !medicalProfile || !ClinicId) {
      throw new Error('Необходимо заполнить обязательные поля: email, rawPassword, fullName, medicalProfile, clinicId');
    }
    const clinicExists = await Clinic.findByPk(ClinicId);
    if (!clinicExists) {
      throw new Error(`Медицинское учреждение с ID №${ClinicId} не найдено.`);
    }
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      throw new Error('Сотрудник с таким email уже зарегистрирован');
    }
    let finalPosition = 'Врач';
    let finalSpecialty = medicalProfile;
    const purePositions = ['Главврач', 'Медсестра', 'Врач скорой помощи', 'Фельдшер', 'Регистратор'];
    if (purePositions.includes(medicalProfile)) {
      finalPosition = medicalProfile;
      finalSpecialty = 'Общий медицинский профиль';
    }
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const newStaff = await User.create({
      email,
      password: hashedPassword,
      fullName,
      role: 'doctor', 
      position: finalPosition,
      specialty: finalSpecialty,
      ClinicId: Number(ClinicId),
      isTemporaryPassword: true 
    });
    return newStaff;
  }
};
module.exports = manageStaff;