module.exports = (sequelize, DataTypes) => {
  const Subregion = sequelize.define("Subregion", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Subregion.associate = (models) => {
    Subregion.belongsTo(models.Region, {
      foreignKey: "regionId",
      as: "region",
    });
    Subregion.hasMany(models.District, {
      foreignKey: "subregionId",
      as: "districts",
    });
    Subregion.hasMany(models.RegionalCoordinator, {
      foreignKey: "subregionId",
      as: "regionalCoordinators",
    });
  };

  return Subregion;
};
