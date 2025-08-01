module.exports = (sequelize, DataTypes) => {
  const GeneralElectionOppositionCandidateParticipation = sequelize.define("GeneralElectionOppositionCandidateParticipation", {
    oppositionCandidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "GeneralElectionOppositionCandidates", key: "id" }
    },
    nrmCandidateParticipationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "CandidateParticipations", key: "id" },
      comment: "Reference to the NRM candidate this opposition is running against"
    },
    electionType: {
      type: DataTypes.ENUM("GENERAL"),
      allowNull: false,
      defaultValue: "GENERAL"
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
      type: DataTypes.STRING, // e.g. GENERAL.DISTRICT.LCV_MAJORS
      allowNull: false
    },
    category: {
      type: DataTypes.STRING, 
      allowNull: true
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    regionId: {
      type: DataTypes.INTEGER,
      references: { model: "Regions", key: "id" }
    },
    subregionId: {
      type: DataTypes.INTEGER,
      references: { model: "Subregions", key: "id" }
    },
    districtId: {
      type: DataTypes.INTEGER,
      references: { model: "Districts", key: "id" }
    },
    constituencyMunicipalityId: {
      type: DataTypes.INTEGER,
      references: { model: "ConstituencyMunicipality", key: "id" }
    },
    subcountyDivisionId: {
      type: DataTypes.INTEGER,
      references: { model: "SubcountyDivision", key: "id" }
    },
    parishWardId: {
      type: DataTypes.INTEGER,
      references: { model: "ParishWard", key: "id" }
    },
    villageCellId: {
      type: DataTypes.INTEGER,
      references: { model: "VillageCell", key: "id" }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING, // e.g., "active", "inactive"
      defaultValue: "active"
    }
  });

  GeneralElectionOppositionCandidateParticipation.associate = models => {
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.GeneralElectionOppositionCandidate, { 
      foreignKey: "oppositionCandidateId", 
      as: "oppositionCandidate" 
    });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.CandidateParticipation, { 
      foreignKey: "nrmCandidateParticipationId", 
      as: "nrmCandidateParticipation" 
    });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.Region, { foreignKey: "regionId", as: "region" });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.Subregion, { foreignKey: "subregionId", as: "subregion" });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.District, { foreignKey: "districtId", as: "district" });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.ConstituencyMunicipality, { 
      foreignKey: "constituencyMunicipalityId", 
      as: "constituencyMunicipality" 
    });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.SubcountyDivision, { 
      foreignKey: "subcountyDivisionId", 
      as: "subcountyDivision" 
    });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.ParishWard, { 
      foreignKey: "parishWardId", 
      as: "parishWard" 
    });
    GeneralElectionOppositionCandidateParticipation.belongsTo(models.VillageCell, { 
      foreignKey: "villageCellId", 
      as: "villageCell" 
    });
    GeneralElectionOppositionCandidateParticipation.hasMany(models.GeneralElectionVote, { 
      foreignKey: "oppositionCandidateParticipationId", 
      as: "votes" 
    });
  };

  return GeneralElectionOppositionCandidateParticipation;
};
