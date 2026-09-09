const { sequelizeConfig } = require('../database/sequelizeConfig');
const { DataTypes } = require('sequelize');

const JopPositionEquipment = sequelizeConfig.define(
    'staffEquipment',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        equipment_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        jop_position_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'jop_position_equipment',
        timestamps: false
    }
);

module.exports = JopPositionEquipment;