const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const EquipmentHistoryFeatures = sequelizeConfig.define(
    'EquipmentHistoryFeatures',
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
        tableName: 'equipment_history_features',
        timestamps: false
    }
);

module.exports = EquipmentHistoryFeatures;