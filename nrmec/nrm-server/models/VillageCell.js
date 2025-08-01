module.exports = (sequelize, DataTypes) => {
  const VillageCell = sequelize.define(
    "VillageCell",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("village", "cell"),
        allowNull: false,
      },
    },
    {
      tableName: "VillageCell",
    }
  );

  VillageCell.associate = (models) => {
    VillageCell.belongsTo(models.ParishWard, {
      foreignKey: "parishWardId",
      as: "parishWard",
    });
  };

  return VillageCell;
};
