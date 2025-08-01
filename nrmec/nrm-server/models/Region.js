module.exports = (sequelize, DataTypes) => {
  const Region = sequelize.define("Region", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Region.associate = (models) => {
    Region.hasMany(models.Subregion, {
      foreignKey: "regionId",
      as: "subregions",
    });
  };

  return Region;
};
