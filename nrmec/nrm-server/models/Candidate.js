module.exports = (sequelize, DataTypes) => {
  const Candidate = sequelize.define("Candidate", {
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
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    levelOfEducation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    electionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Candidate.associate = (models) => {
    Candidate.hasMany(models.CandidateParticipation, {
      foreignKey: "candidateId",
      as: "participations",
    });
    Candidate.hasMany(models.Payment, {
      foreignKey: "candidateId",
      sourceKey: "ninNumber",
      as: "payments",
    });
  };

  return Candidate;
};
