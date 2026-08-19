const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const Article = sequelizeConfig.define(
    'Article',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        code: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        unit: {
            type: DataTypes.ENUM('PIEZA','PAQUETE','CAJA','BLOCK','TIRAS'),
            defaultValue: 'PIEZA'
        },
        observations: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        tableName:'articles',
        timestamps: true
    }
);

module.exports = Article;