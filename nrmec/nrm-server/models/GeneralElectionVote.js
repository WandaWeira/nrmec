module.exports = (sequelize, DataTypes) => {
  const GeneralElectionVote = sequelize.define("GeneralElectionVote", {
    candidateParticipationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "CandidateParticipations", key: "id" },
      comment: "For NRM candidates"
    },
    oppositionCandidateParticipationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "GeneralElectionOppositionCandidateParticipations", key: "id" },
      comment: "For opposition candidates"
    },
    votes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      }
    }
  });

  GeneralElectionVote.associate = models => {
    GeneralElectionVote.belongsTo(models.CandidateParticipation, { 
      foreignKey: "candidateParticipationId", 
      as: "nrmCandidate" 
    });
    GeneralElectionVote.belongsTo(models.GeneralElectionOppositionCandidateParticipation, { 
      foreignKey: "oppositionCandidateParticipationId", 
      as: "oppositionCandidate" 
    });
    GeneralElectionVote.belongsTo(models.User, { 
      foreignKey: "recordedBy", 
      as: "recorder" 
    });
    GeneralElectionVote.belongsTo(models.User, { 
      foreignKey: "updatedBy", 
      as: "updater" 
    });
  };

  return GeneralElectionVote;
};
