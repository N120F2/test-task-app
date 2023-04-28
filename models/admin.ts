const { Model, DataTypes } = require('sequelize');
const Database = require('../database');

const sequelize = Database.sequelize;
//admins
export default class Admin extends Model {
    declare id: number
    declare login: string
    declare password: string
}
Admin.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize, modelName: 'admin' });