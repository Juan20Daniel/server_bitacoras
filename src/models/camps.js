const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const Camp = sequelizeConfig.define(
    'Camp',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        city: {
            type: DataTypes.ENUM('Manzanillo','Colima','Chavarin'),
            defaultValue: 'Manzanillo'
        },
        school_type: {
            type: DataTypes.ENUM('Universidad','Bachillerato'),
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        tableName:'camps',
        timestamps: false
    }
);

module.exports = Camp;