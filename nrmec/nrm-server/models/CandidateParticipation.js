module.exports = (sequelize, DataTypes) => {  const CandidateParticipation = sequelize.define("CandidateParticipation", {
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Candidates", key: "id" }
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
      type: DataTypes.STRING, // e.g. INTERNAL_PARTY.DISTRICT.YOUTH.CHAIRPERSON
      allowNull: false
    },    category: {
      type: DataTypes.STRING, 
      allowNull: true  // Changed to true to support direct positions
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true  // Added subcategory field as optional
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
    isQualified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      vote:{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },    status: {
      type: DataTypes.STRING, // e.g., "approved", "pending"
      defaultValue: "pending"
    },
    isNominated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    nominationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reasonForNomination: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nominatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      }
    },
    nominatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });  CandidateParticipation.associate = models => {
    CandidateParticipation.belongsTo(models.Candidate, { foreignKey: "candidateId", as: "candidate" });
    CandidateParticipation.belongsTo(models.Region, { foreignKey: "regionId", as: "region" });
    CandidateParticipation.belongsTo(models.Subregion, { foreignKey: "subregionId", as: "subregion" });
    CandidateParticipation.belongsTo(models.District, { foreignKey: "districtId", as: "district" });
    CandidateParticipation.belongsTo(models.ConstituencyMunicipality, { foreignKey: "constituencyMunicipalityId", as: "constituencyMunicipality" });
    CandidateParticipation.belongsTo(models.SubcountyDivision, { foreignKey: "subcountyDivisionId", as: "subcountyDivision" });
    CandidateParticipation.belongsTo(models.ParishWard, { foreignKey: "parishWardId", as: "parishWard" });    CandidateParticipation.belongsTo(models.VillageCell, { foreignKey: "villageCellId", as: "villageCell" });
    CandidateParticipation.belongsTo(models.User, { foreignKey: "nominatedBy", as: "nominator" });
    CandidateParticipation.hasMany(models.Payment, { foreignKey: "candidateParticipationId", as: "payments" });
    CandidateParticipation.hasMany(models.Vote, { foreignKey: "candidateParticipationId", as: "votes" });
  };

  return CandidateParticipation;
};
