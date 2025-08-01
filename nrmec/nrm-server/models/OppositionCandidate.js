module.exports = (sequelize, DataTypes) => {
  const OppositionCandidate = sequelize.define("OppositionCandidate", {
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    electionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return OppositionCandidate;
};
