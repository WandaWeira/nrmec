module.exports = (sequelize, DataTypes) => {
  const ParishWard = sequelize.define(
    "ParishWard",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("parish", "ward"),
        allowNull: false,
      },
    },
    {
      tableName: "ParishWard",
    }
  );

  ParishWard.associate = (models) => {
    ParishWard.belongsTo(models.SubcountyDivision, {
      foreignKey: "subcountyDivisionId",
      as: "subcountyDivision",
    });
    ParishWard.hasMany(models.VillageCell, {
      foreignKey: "parishWardId",
      as: "villagesCells",
    });
    ParishWard.hasMany(models.PollingStation, {
      foreignKey: "parishWardId",
      as: "pollingStations",
    });
  };

  return ParishWard;
};
