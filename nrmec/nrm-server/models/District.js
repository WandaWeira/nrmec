module.exports = (sequelize, DataTypes) => {
  const District = sequelize.define("District", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hasCity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  District.associate = (models) => {
    District.belongsTo(models.Subregion, {
      foreignKey: "subregionId",
      as: "subregion",
    });

    // Non-City Structure: District -> Constituencies
    District.hasMany(models.ConstituencyMunicipality, {
      foreignKey: "districtId",
      as: "constituenciesMunicipalities",
    });
  };

  return District;
};
