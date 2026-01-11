const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const Department = sequelizeConfig.define(
    'Department',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,    
        },
        city: {
            type: DataTypes.ENUM('Manzanillo','Colima','Chavarin'),
            defaultValue: 'Manzanillo'
        },
        school_type: {
            type: DataTypes.ENUM('Universidad','Bachillerato'),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
    },
    {
        tableName: 'departments',
        timestamps: true,
    }
);

module.exports = Department;