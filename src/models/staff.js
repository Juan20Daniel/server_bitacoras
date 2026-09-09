const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const Staff = sequelizeConfig.define(
    'Staff',
    {
        id: {
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
            allowNull: true
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        role: {
            type: DataTypes.ENUM('basic','rrhh','operator','admin'),
            defaultValue: 'basic',
        },
        folio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        jop_position_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
        tableName: 'staff',
        timestamps: true,
    }
);

module.exports = Staff;