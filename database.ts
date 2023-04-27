import { Sequelize, Model, DataTypes } from "sequelize";
class Database {
    static sequelize: Sequelize
    static init() {
        //config evs        
        const database = process.env.DB_NAME || "database";
        const dbLogin = process.env.DB_LOGIN || "login";
        const dbPass = process.env.DB_PASSWORD || "pass";
        const db_host = process.env.DB_HOST_ADDRES || "localhost";
        //database       
        Database.sequelize = new Sequelize(database, dbLogin, dbPass, {
            dialect: "mysql",
            host: db_host,
            define: {
                timestamps: false
            }
        });
    }
}
Database.init();
module.exports = Database;