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
        name: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        inventory_type: {
            type: DataTypes.ENUM('static','variable'),
            defaultValue: 'static',
        }
    },
    {
        tableName: 'departments',
        timestamps: true,
    }
);

module.exports = Department;