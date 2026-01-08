const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const Department = sequelizeConfig.define(
    'Department',
    {
        id_department: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,    
        },
        city: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('Universidad','Bachillerato'),
            allowNull: false
        },
        department_name: {
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