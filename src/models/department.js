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
    },
    {
        tableName: 'departments',
        timestamps: true,
    }
);

module.exports = Department;