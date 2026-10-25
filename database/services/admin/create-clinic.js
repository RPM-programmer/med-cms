const Clinic = require('../../models/clinics');

const createClinic = {
  /**
   * Добавить новую больницу, поликлинику или станцию скорой помощи
   */
  async create(clinicData) {
    const { name, type, address, phone } = clinicData;
    
    if (!name || !type || !address) {
      throw new Error('Поля name, type и address обязательны для заполнения');
    }

    const candidate = await Clinic.findOne({ where: { name } });
    if (candidate) {
      throw new Error('Медицинское учреждение с таким названием уже зарегистрировано');
    }

    return await Clinic.create({ name, type, address, phone });
  },

  /**
   * Получить список всех учреждений в системе
   */
  async getAll() {
    return await Clinic.findAll({ order: [['name', 'ASC']] });
  }
};

module.exports = createClinic;
