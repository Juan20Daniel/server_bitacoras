const { sequelizeConfig } = require('../database/sequelizeConfig');
const { DataTypes } = require('sequelize');

const StaffEquipment = sequelizeConfig.define(
    'staffEquipment',
    {
        equipment_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Equipment',
                key: 'id'
            }
        },
        staff_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Staff',
                key:'id'
            }
        }
    },
    {
        tableName: 'staff_equipment',
        timestamps: false
    }
);

module.exports = StaffEquipment;