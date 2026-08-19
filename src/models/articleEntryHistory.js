const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const ArticleEntryHistory = sequelizeConfig.define(
    'ArticleEntryHistory',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bill: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
    },
    {
        tableName:'article_entry_history',
        timestamps: true
    }
);

module.exports = ArticleEntryHistory;