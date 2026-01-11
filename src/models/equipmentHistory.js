const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const EquipmentHistory = sequelizeConfig.define(
    'EquipmentHistory',
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement:true
        },
        firstname: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        name_equipment: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        image_equipment: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        own: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        fixed_asset_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        clasification: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        brand: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        state: {
            type: DataTypes.ENUM('new', 'regular','good'),
            defaultValue: 'new',
        },
        observations: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        folio: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        inventory_type: {
            type: DataTypes.ENUM('office','staff'),
            defaultValue: 'staff',
        }
    },
    {
        tableName: 'equipment_history',
        timestamps: true
    }
);

module.exports = EquipmentHistory;