// nrm-server/models/Registrar.js
module.exports = (sequelize, DataTypes) => {
    const Registrar = sequelize.define("Registrar", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ninNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      administrativeUnitType: {
        type: DataTypes.ENUM('village', 'parish', 'subcounty', 'constituency'),
        allowNull: false,
      },
      administrativeUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    });
  
    Registrar.associate = (models) => {
      // Add associations based on administrativeUnitType
      Registrar.belongsTo(models.VillageCell, {
        foreignKey: 'administrativeUnitId',
        constraints: false
      });
      Registrar.belongsTo(models.ParishWard, {
        foreignKey: 'administrativeUnitId',
        constraints: false
      });
      Registrar.belongsTo(models.SubcountyDivision, {
        foreignKey: 'administrativeUnitId',
        constraints: false
      });
      Registrar.belongsTo(models.ConstituencyMunicipality, {
        foreignKey: 'administrativeUnitId',
        constraints: false
      });
    };
  
    return Registrar;
  };