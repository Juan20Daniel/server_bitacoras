const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const EquipmentFeatures = sequelizeConfig.define(
    'EquipmentVariable',
    {
        id_feature: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING(40),
            allowNull: false
        }
    },
    {
        tableName: 'equipment_features',
        timestamps: false
    }
);

module.exports = EquipmentFeatures;