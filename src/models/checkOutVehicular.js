const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const CheckOutVehicular = sequelizeConfig.define(
    'CheckOutVehicular',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departure_km: {
            type: DataTypes.INTEGER(6),
            allowNull: true
        },
        arrival_km: {
            type: DataTypes.INTEGER(6),
            allowNull: true
        },
        outlet_tank_lavel: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        input_tank_lavel: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        destination: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    },
    {
        tableName:'check_out_vehicular',
        timestamps: false
    }
);

module.exports = CheckOutVehicular;