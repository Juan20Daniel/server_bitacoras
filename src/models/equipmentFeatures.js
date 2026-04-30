const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const EquipmentFeatures = sequelizeConfig.define(
    'EquipmentVariable',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING(200),
            allowNull: false
        }
    },
    {
        tableName: 'equipment_features',
        timestamps: false
    }
);

module.exports = EquipmentFeatures;