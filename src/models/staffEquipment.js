const { sequelizeConfig } = require('../database/sequelizeConfig');
const { DataTypes } = require('sequelize');

const StaffEquipment = sequelizeConfig.define(
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
        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'staff_equipment',
        timestamps: false
    }
);

module.exports = StaffEquipment;