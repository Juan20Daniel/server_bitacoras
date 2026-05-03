const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const Vehicle = sequelizeConfig.define(
    'Vehicle',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        init_mileage: {
            type: DataTypes.INTEGER(6),
            allowNull: false,
        },
        init_tank_lavel: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        tableName: 'vehicles',
        timestamps: true
    }
);

module.exports = Vehicle;