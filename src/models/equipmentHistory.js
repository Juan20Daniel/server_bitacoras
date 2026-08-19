const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const EquipmentHistory = sequelizeConfig.define(
    'EquipmentHistory',
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement:true
        }
    },
    {
        tableName: 'equipment_history',
        timestamps: true
    }
);

module.exports = EquipmentHistory;