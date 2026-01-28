const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const CheckOut = sequelizeConfig.define(
    'checkOut',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        check_Out_type: {
            type: DataTypes.ENUM('staff', 'vehicular'),
            defaultValue: 'staff',
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        departure_time: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        arrival_time: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        selfie_img: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('programmed','initiated','finalized','canceled','incomplete','removed'),
            defaultValue: 'programmed'
        },
        expiration_time: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }
    },
    {
        tableName: 'check_out',
        timestamps: true
    }
);

module.exports = CheckOut