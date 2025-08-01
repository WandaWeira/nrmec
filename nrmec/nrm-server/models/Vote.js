module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define("Vote", {    candidateParticipationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    votes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    electionType: {
      type: DataTypes.ENUM("INTERNAL_PARTY", "PRIMARIES", "GENERAL"),
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM(
        "VILLAGE_CELL",
        "PARISH_WARD",
        "SUBCOUNTY_DIVISION",
        "CONSTITUENCY_MUNICIPALITY",
        "DISTRICT",
        "NATIONAL"
      ),
      allowNull: false
    },
    positionPath: {
      type: DataTypes.STRING,
      allowNull: false
    },    regionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subregionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    districtId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    constituencyMunicipalityId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subcountyDivisionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parishWardId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    villageCellId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "Votes"
  });
  Vote.associate = models => {
    Vote.belongsTo(models.CandidateParticipation, { 
      foreignKey: "candidateParticipationId", 
      as: "candidateParticipation" 
    });
    Vote.belongsTo(models.Region, { foreignKey: "regionId", as: "region" });
    Vote.belongsTo(models.Subregion, { foreignKey: "subregionId", as: "subregion" });
    Vote.belongsTo(models.District, { foreignKey: "districtId", as: "district" });
    Vote.belongsTo(models.ConstituencyMunicipality, { 
      foreignKey: "constituencyMunicipalityId", 
      as: "constituencyMunicipality" 
    });
    Vote.belongsTo(models.SubcountyDivision, { 
      foreignKey: "subcountyDivisionId", 
      as: "subcountyDivision" 
    });
    Vote.belongsTo(models.ParishWard, { foreignKey: "parishWardId", as: "parishWard" });
    Vote.belongsTo(models.VillageCell, { foreignKey: "villageCellId", as: "villageCell" });
    Vote.belongsTo(models.User, { foreignKey: "recordedBy", as: "recorder" });
    Vote.belongsTo(models.User, { foreignKey: "updatedBy", as: "updater" });
  };

  return Vote;
};
