module.exports = (sequelize, DataTypes) => {
  const SubcountiesDivisionsOppositionCandidate = sequelize.define(
    "SubcountiesDivisionsOppositionCandidate",
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
        allowNull: true,
      },
      subcounty: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parish: {
        type: DataTypes.STRING,
        allowNull: true,
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
      subcountiesDivisionsElectionType: {
        type: DataTypes.ENUM(
          "partyStructure",
          "lc3",
          "SubcountyCouncillors",
          "SubcountySIGCouncillors"
        ),
        allowNull: false,
      },
      vote: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      party: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }
  );

  SubcountiesDivisionsOppositionCandidate.associate = (models) => {
    SubcountiesDivisionsOppositionCandidate.belongsTo(
      models.OppositionCandidate,
      {
        foreignKey: "oppositionCandidateId",
      }
    );
  };

  return SubcountiesDivisionsOppositionCandidate;
};
