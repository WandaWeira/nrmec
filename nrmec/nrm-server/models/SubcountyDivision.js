module.exports = (sequelize, DataTypes) => {
  const SubcountyDivision = sequelize.define(
    "SubcountyDivision",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("subcounty", "division"),
        allowNull: false,
      },
    },
    {
      tableName: "SubcountyDivision",
    }
  );

  SubcountyDivision.associate = (models) => {
    SubcountyDivision.belongsTo(models.ConstituencyMunicipality, {
      foreignKey: "constituencyDivisionId",
      as: "constituencyDivision",
    });
    SubcountyDivision.hasMany(models.ParishWard, {
      foreignKey: "subcountyDivisionId",
      as: "parishesWards",
    });
  };

  return SubcountyDivision;
};
