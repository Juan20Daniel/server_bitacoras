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
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('variable','static'),
            defaultValue: 'variable'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        observations: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName:'equipments',
        timestamps: true
    }
);

module.exports = Equipment;