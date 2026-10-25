const path = require("path");
const UserAddress = require(path.join(__dirname, '..', '..', 'models', 'user-addresses'));
const calcDistrict = {
  determineLocation(street, houseNumber) {
    const cleanedStreet = street.trim().toLowerCase();
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
    return {
      assignedDistrict: 'Участок №3 (Общий)',
      assignedCabinet: 'Кабинет №301 (Врач общей практики)'
    };
  },
  async saveAddress(userId, addressData) {
    const { city, street, houseNumber } = addressData;
    if (!city || !street || !houseNumber) {
      throw new Error('Для привязки адреса необходимы город, улица и номер дома');
    }
    const { assignedDistrict, assignedCabinet } = this.determineLocation(street, houseNumber);
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