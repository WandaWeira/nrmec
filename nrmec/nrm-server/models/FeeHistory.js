
  // models/FeeHistory.js
  module.exports = (sequelize, DataTypes) => {
    const FeeHistory = sequelize.define("FeeHistory", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      feeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Fees',
          key: 'id'
        }
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    }, {
      timestamps: true,
      indexes: [
        {
          fields: ['feeId'],
          name: 'fee_history_fee_id'
        },
        {
          fields: ['date'],
          name: 'fee_history_date'
        }
      ]
    });
  
    FeeHistory.associate = (models) => {
      FeeHistory.belongsTo(models.Fee, {
        foreignKey: 'feeId',
        as: 'fee'
      });
    };
  
    return FeeHistory;
  };
