const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PendingAction = sequelize.define('PendingAction', {
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
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    actionBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    requestedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return PendingAction;
};
