// models/payment.js
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      candidateId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Candidates',
          key: 'ninNumber'
        }
      },
      candidateParticipationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'CandidateParticipations',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['cash', 'bank', 'mobile']]
        }
      },
      transactionCode: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null for cash payments
      },
      electionType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subType: {
        type: DataTypes.STRING,
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
      nestedCategory: {
        type: DataTypes.STRING,
        allowNull: true
      },
      position: {
        type: DataTypes.STRING,
        allowNull: true
      },
      positionPath: { // Added positionPath
        type: DataTypes.STRING,
        allowNull: false // Should be false if we are always capturing it
      },
      receiptNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'completed',
        validate: {
          isIn: [['completed', 'pending', 'failed']]
        }
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      processedBy: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'payments',
      timestamps: true
    });
  
  Payment.associate = (models) => {
      Payment.belongsTo(models.Candidate, {
        foreignKey: 'candidateId',
        onDelete: 'CASCADE'
      });
      
      Payment.belongsTo(models.CandidateParticipation, {
        foreignKey: 'candidateParticipationId',
        onDelete: 'SET NULL'
      });
    };
  
    return Payment;
  };