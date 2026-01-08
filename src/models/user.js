const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const User = sequelizeConfig.define(
    'User',
    {
        id_user: {
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
        role: {
            type: DataTypes.ENUM('admin','basic','rrhh','operator'),
            allowNull: false,
            defaultValue: 'basic',
        }
    },
    {
        tableName: 'users',
        timestamps: true,
    }
);

module.exports = User;