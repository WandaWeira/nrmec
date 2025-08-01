module.exports = (sequelize, DataTypes) => {
  const ConstituencyMunicipalityCandidate = sequelize.define(
    "ConstituencyMunicipalityCandidate",
    {
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
      councilorType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      region: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subregion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      district: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      constituency: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      subcounty: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      parish: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      village: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      constituencyMunicipalityElectionType: {
        type: DataTypes.ENUM(
          "mps",
          "partyStructure",
          "municipalityMayor",
          "municipalityMp",
          "municipalityCouncillors",
          "municipalitySIGCouncillors"
        ),
        allowNull: false,
      },

      isQualified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      vote: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    }
  );

  ConstituencyMunicipalityCandidate.associate = (models) => {
    ConstituencyMunicipalityCandidate.belongsTo(models.Candidate, {
      foreignKey: "candidateId",
    });
  };

  return ConstituencyMunicipalityCandidate;
};
