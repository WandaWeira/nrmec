module.exports = (sequelize, DataTypes) => {
  const PollingStation = sequelize.define("PollingStation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  PollingStation.associate = (models) => {
    PollingStation.belongsTo(models.ParishWard, {
      foreignKey: 'parishWardId',
      as: 'parishWard'
    });
  };

  return PollingStation;
};