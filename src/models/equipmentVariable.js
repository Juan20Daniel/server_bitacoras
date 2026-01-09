const { DataTypes, ENUM } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const EquipmentVariable = sequelizeConfig.define(
    'EquipmentVariable',
    {
        code: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        state: {
            type: DataTypes.ENUM('PIEZA','PAQUETE','CAJA','BLOCK','TIRAS'),
            defaultValue: 'PIEZA'
        },
        code: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    },
    {
        tableName: 'equipment_variable',
        timestamps: false
    }
);

module.exports = EquipmentVariable;