const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const Equipment = sequelizeConfig.define(
    'Equipment',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image: {
            type: DataTypes.STRING(50),
            allowNull: true,
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
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        observations: {
            type: DataTypes.STRING(150),
            allowNull: true
        }
    },
    {
        tableName: 'equipment',
        timestamps: false
    }
);

module.exports = Equipment;