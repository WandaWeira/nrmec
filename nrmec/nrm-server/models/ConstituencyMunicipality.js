module.exports = (sequelize, DataTypes) => {
  const ConstituencyMunicipality = sequelize.define(
    "ConstituencyMunicipality",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("constituency", "municipality"),
        allowNull: false,
      },
    },
    {
      tableName: "ConstituencyMunicipality",
    }
  );

  ConstituencyMunicipality.associate = (models) => {
    ConstituencyMunicipality.belongsTo(models.District, {
      foreignKey: "districtId",
      as: "district",
    });
    ConstituencyMunicipality.hasMany(models.SubcountyDivision, {
      foreignKey: "constituencyDivisionId",
      as: "subcountiesDivisions",
    });
  };

  return ConstituencyMunicipality;
};
