const { DataTypes } = require('sequelize');
const path = require("path")
const { getSequelizeInstance } = require(path.join('..', 'config', 'db-init.js'));
const sequelize = getSequelizeInstance();
const UserAddress = sequelize.define('UserAddress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  houseNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assignedDistrict: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assignedCabinet: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});
module.exports = UserAddress;