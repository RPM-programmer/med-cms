const UserAddress = require('../../models/user-addresses');

const calcDistrict = {
  /**
   * Логика сопоставления адреса с конкретным участком и кабинетом клиники
   */
  determineLocation(street, houseNumber) {
    const cleanedStreet = street.trim().toLowerCase();
    
    // Простой демонстрационный алгоритм распределения по улицам
    // В реальной жизни эти данные можно загружать из отдельной таблицы соответствия
    if (cleanedStreet.includes('ленина') || cleanedStreet.includes('центральная')) {
      return {
        assignedDistrict: 'Участок №1 (Центральный)',
        assignedCabinet: 'Кабинет №102 (Терапевт / Педиатр)'
      };
    }
    
    if (cleanedStreet.includes('пушкина') || cleanedStreet.includes('мичурина')) {
      return {
        assignedDistrict: 'Участок №2 (Северный)',
        assignedCabinet: 'Кабинет №205 (Терапевт / Педиатр)'
      };
    }

    // Универсальный дефолтный участок для всех остальных адресов
    return {
      assignedDistrict: 'Участок №3 (Общий)',
      assignedCabinet: 'Кабинет №301 (Врач общей практики)'
    };
  },

  /**
   * Создать или обновить адрес пациента с автоматическим вычислением участка
   */
  async saveAddress(userId, addressData) {
    const { city, street, houseNumber } = addressData;

    if (!city || !street || !houseNumber) {
      throw new Error('Для привязки адреса необходимы город, улица и номер дома');
    }

    // Вычисляем участок и кабинет на основе алгоритма
    const { assignedDistrict, assignedCabinet } = this.determineLocation(street, houseNumber);

    // Проверяем, есть ли уже привязанный адрес у пользователя
    const existingAddress = await UserAddress.findOne({ where: { UserId: userId } });

    if (existingAddress) {
      return await existingAddress.update({
        city,
        street,
        houseNumber,
        assignedDistrict,
        assignedCabinet
      });
    }

    return await UserAddress.create({
      UserId: userId,
      city,
      street,
      houseNumber,
      assignedDistrict,
      assignedCabinet
    });
  }
};

module.exports = calcDistrict;
