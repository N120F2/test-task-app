const { Model, DataTypes } = require('sequelize');
const Database = require('../database');

const sequelize = Database.sequelize;
//user model
export default class User extends Model {
    declare id: number
    declare email: string
    declare firstName: string
    declare lastName: string
    declare image: Buffer
    declare pdf: BinaryData
}
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        defaultValue: null

    },
    pdf: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        defaultValue: null
    }
}, { sequelize, modelName: 'user' });