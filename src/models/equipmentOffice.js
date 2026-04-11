const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const EquipmentOffice = sequelizeConfig.define(
    'EquipmentOffice',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        own: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        fixed_asset_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        clasification: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        brand: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        model: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        state: {
            type: DataTypes.ENUM('new', 'regular','good'),
            defaultValue: 'new'
        },
        folio: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        inventory_type: {
            type: DataTypes.ENUM('office','staff'),
            defaultValue: 'staff'
        },
        
    },
    {
        tableName: 'equipment_office',
        timestamps: false
    }
);

module.exports = EquipmentOffice;