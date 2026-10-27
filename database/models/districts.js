module.exports = (sequelize, DataTypes) => {
  const District = sequelize.define('District', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cabinet: {
      type: DataTypes.STRING,
      allowNull: false
    },
    doctorName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Список улиц через запятую, автоматически приводимый к нижнему регистру
    coveredStreets: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        this.setDataValue('coveredStreets', value.toLowerCase().trim());
      }
    }
  }, {
    timestamps: true
  });

  // Настройка связи без круговой зависимости
  District.associate = (models) => {
    // Участок принадлежит конкретной клинике
    District.belongsTo(models.Clinic, { foreignKey: 'ClinicId', onDelete: 'CASCADE' });
  };

  return District;
};
