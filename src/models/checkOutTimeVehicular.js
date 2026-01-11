const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const CheckOutTimeVehicular = sequelizeConfig.define(
    'CheckOutTimeVehicular',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departure_mileage: {
            type: DataTypes.INTEGER(6),
            allowNull: false
        },
        arrival_mileage: {
            type: DataTypes.INTEGER(6),
            allowNull: true
        },
        output_gasoline: {
            type: DataTypes.INTEGER(10),
            allowNull: false
        },
        arrival_gasoline: {
            type: DataTypes.INTEGER(6),
            allowNull: true
        },
        destination: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    },
    {
        tableName:'check_out_time_vehicular',
        timestamps: false
    }
);

module.exports = CheckOutTimeVehicular;