module.exports = (sequelize, DataTypes) => {
    const DistrictCandidate = sequelize.define(
      "DistrictCandidate",
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
        districtElectionType: {
          type: DataTypes.ENUM(
            "partyStructure",
            "lcv",
            "mayor",
            "womanMp",
            "DistrictCouncillors",
            "DistrictSIGCouncillors"
          ),
          allowNull: false,
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
        }
      }
      
    );
  
    DistrictCandidate.associate = (models) => {
      DistrictCandidate.belongsTo(models.Candidate, {
        foreignKey: "candidateId",
      });
    };
  
    return DistrictCandidate;
  };
