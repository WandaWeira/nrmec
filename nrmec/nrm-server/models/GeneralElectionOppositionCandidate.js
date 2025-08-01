module.exports = (sequelize, DataTypes) => {
  const GeneralElectionOppositionCandidate = sequelize.define("GeneralElectionOppositionCandidate", {
    ninNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    party: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Political party the opposition candidate belongs to"
    },
    electionType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "GENERAL",
    },
  });
  return GeneralElectionOppositionCandidate;
};
