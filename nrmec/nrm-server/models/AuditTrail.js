const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditTrail = sequelize.define('AuditTrail', {
    actionType: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    actionBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED','REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
  });

  AuditTrail.associate = (models) => {
    AuditTrail.belongsTo(models.User, { as: 'actionByUser', foreignKey: 'actionBy' });
    AuditTrail.belongsTo(models.User, { as: 'approvedByUser', foreignKey: 'approvedBy' });
  };

  return AuditTrail;
};
