import { Sequelize, Model, DataTypes } from "sequelize";
class Database {
    static sequelize: Sequelize
    static init() {
        if(Database.sequelize) return
        //config evs        
        const database = process.env.DB_NAME || "database";
        const dbLogin = process.env.DB_LOGIN || "login";
        const dbPass = process.env.DB_PASSWORD || "pass";
        const db_host = process.env.DB_HOST_ADDRES || "localhost";
        const db_port = process.env.DB_PORT || "3306";
        //database       
        Database.sequelize = new Sequelize(database, dbLogin, dbPass, {
            dialect: "mysql",
            host: db_host,
            port: +db_port,
            define: {
                timestamps: false
            }
        });
    }
}
Database.init();
module.exports = Database;