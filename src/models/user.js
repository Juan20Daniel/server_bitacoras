const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const User = sequelizeConfig.define(
    'User',
    {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstname: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        role: {
            type: DataTypes.ENUM('basic','rrhh','operator','admin'),
            defaultValue: 'basic',
        }
    },
    {
        tableName: 'users',
        timestamps: true,
    }
);

module.exports = User;