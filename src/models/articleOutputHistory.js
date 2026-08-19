const { DataTypes } = require('sequelize');
const { sequelizeConfig } = require('../database/sequelizeConfig');

const ArticleOutputHistory = sequelizeConfig.define(
    'ArticleOutputHistory',
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
    },
    {
        tableName:'article_output_history',
        timestamps: true
    }
);

module.exports = ArticleOutputHistory;