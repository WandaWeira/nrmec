module.exports = (sequelize, DataTypes) => {
  const NationalOppositionCandidate = sequelize.define("NationalOppositionCandidate", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
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
    nationalElectionType: {
      type: DataTypes.ENUM(
        "cec",
        "leagues",
        "presidential",
        "sigmps",
        "eala",
        "speakership",
        "parliamentaryCaucus"
      ),
      allowNull: false,
    },
    vote:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    party: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  NationalOppositionCandidate.associate = (models) => {
    NationalOppositionCandidate.belongsTo(models.OppositionCandidate, { foreignKey: 'oppositionCandidateId' });
  };

  return NationalOppositionCandidate;
};