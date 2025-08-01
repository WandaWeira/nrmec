// models/Fee.js
module.exports = (sequelize, DataTypes) => {
  const Fee = sequelize.define("Fee", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    electionType: {
      type: DataTypes.ENUM(
        'INTERNAL_PARTY',
        'PRIMARIES'
      ),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    level: {
      type: DataTypes.ENUM(
        'VILLAGE_CELL',
        'PARISH_WARD',
        'SUBCOUNTY_DIVISION',
        'CONSTITUENCY_MUNICIPALITY',
        'DISTRICT',
        'NATIONAL'
      ),
      allowNull: false
    },
    subType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100), // Changed from DataTypes.STRING
      allowNull: true
    },
    subcategory: {
      type: DataTypes.STRING(100), // Changed from DataTypes.STRING
      allowNull: true
    },
    nestedCategory: {
      type: DataTypes.STRING(100), // Changed from DataTypes.STRING
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(100), // Changed from DataTypes.STRING
      allowNull: true
    },
    positionPath: {
      type: DataTypes.STRING,
      allowNull: false, // Changed to false as it's the primary identifier
      unique: 'unique_position_path'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
  timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['positionPath'],
        where: {
          isActive: true
        },
        name: 'unique_active_fee_path'
      }
    ]
  });

  Fee.associate = (models) => {
    Fee.hasMany(models.FeeHistory, {
      as: 'feeHistory',
      foreignKey: 'feeId',
      onDelete: 'CASCADE'
    });
  };

  return Fee;
};