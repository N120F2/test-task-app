import express, { Express, Request, Response } from 'express';
const { Sequelize, Model, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

//config evs
dotenv.config();
const port  = process.env.PORT || 8081;
const database  = process.env.DB_NAME || "database";
const dbLogin  = process.env.DB_LOGIN || "login";
const dbPass  = process.env.DB_PASSWORD || "pass";
const db_host  = process.env.DB_HOST_ADDRES || "localhost";
//database
const sequelize = new Sequelize(database,dbLogin , dbPass, {
  dialect: "mysql",
  host: db_host,
  define: {
    timestamps: false
  }
});
//model
const User = sequelize.define("user", {
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
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null

  },
  pdf: {
    type: DataTypes.STRING.BINARY,
    allowNull: true,
    defaultValue: null
  }
});
sequelize.sync()
  .then((result: any) => console.log(result))
  .catch((err: any) => console.log(err));

  /*User.create({
    email: "asdasd@sdfsdf.dsf",
    firstName:"user1",
    lastName: "us"  
  }).then((res: any)=>{
    console.log(res);
  }).catch((err: any)=>console.log(err));*/
//app
const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});