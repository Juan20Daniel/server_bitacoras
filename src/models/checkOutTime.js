const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const CheckOutTime = sequelizeConfig.define(
    'checkOutTime',
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
            type: DataTypes.ENUM('programmed','initiated','finalized','canceled','incomplete'),
            defaultValue: 'programmed'
        },
        expiration_time: {
            type: DataTypes.BIGINT,
            allowNull: false,
        }
    },
    {
        tableName: 'check_out_time',
        timestamps: true
    }
);

module.exports = CheckOutTime