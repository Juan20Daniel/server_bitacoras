const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const JopPositionHistory = sequelizeConfig.define(
    'JopPositionHistory',
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement:true
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
        folio: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        tableName: 'jop_position_history',
        timestamps: true
    }
);

module.exports = JopPositionHistory;