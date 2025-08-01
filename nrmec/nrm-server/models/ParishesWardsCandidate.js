module.exports = (sequelize, DataTypes) => {
  const ParishesWardsCandidate = sequelize.define("ParishesWardsCandidate", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subregion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    constituency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subcounty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parish: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    village: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    municipality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    division: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cell: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parishwardElectionType: {
      type: DataTypes.ENUM("partyStructure", "lc2"),
      allowNull: false,
    },
    isQualified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    vote:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    }
  });

  ParishesWardsCandidate.associate = (models) => {
    ParishesWardsCandidate.belongsTo(models.Candidate, {
      foreignKey: "candidateId",
    });
    // Add this line
    // ParishesWardsCandidate.belongsTo(models.OppositionCandidate, {
    //   foreignKey: "oppositionCandidateId",
    // });
  };

  return ParishesWardsCandidate;
};
