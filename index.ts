import express, { Express, Request, Response } from 'express';
const { Sequelize, Model, DataTypes } = require('sequelize');
const fs = require('fs');
const multer = require("multer");

const dotenv = require('dotenv');

//config evs
dotenv.config();
const port = process.env.PORT || 8081;
const database = process.env.DB_NAME || "database";
const dbLogin = process.env.DB_LOGIN || "login";
const dbPass = process.env.DB_PASSWORD || "pass";
const db_host = process.env.DB_HOST_ADDRES || "localhost";
//database
const sequelize = new Sequelize(database, dbLogin, dbPass, {
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

//app
const app: Express = express();
const urlencodedParser = express.urlencoded({ extended: false });
app.use(urlencodedParser);
//app.use(multer({ dest: "usersImages" }).single("filedata"));

sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((err: any) => console.log(err));

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

//user
app.get("/users", function (req: Request, res: Response) {
  User.findAll({ raw: true })
    .then((data: object[]) => {
      res.status(200);
      res.set('Content-Type', 'application/json;charset=utf-8');
      res.send(data);
    })
    .catch((err: any) => {
      console.log(err);
      res.sendStatus(500);
    });
});
app.get("/user", function (req: Request, res: Response) {
  if (!req.body) return res.sendStatus(400);
  const id = req.query.id;
  console.log(id)
  User.findOne({ where: { id: id } })
    .then((user: object) => {
      if (!user) return res.sendStatus(404);
      res.status(200);
      res.set('Content-Type', 'application/json;charset=utf-8');
      res.send(user);
    })
    .catch((err: any) => {
      console.log(err);
      res.sendStatus(500);
    });
});
app.post("/createUser", function (req: Request, res: Response) {
  if (!req.body) return res.sendStatus(400);
  const email = req.query.email;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName;
  User.create({ email: email, firstName: firstName, lastName: lastName })
    .then((user: any) => {
      res.send({ id: user.id });
    })
    .catch((err: any) => {
      console.log(err);
      res.sendStatus(500);
    });
});
app.post("/editUser", function (req: Request, res: Response) {
  if (!req.body) return res.sendStatus(400);
  const email = req.query.email;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName; 
  const userid = req.query.id;
  User.update({ email: email, firstName: firstName, lastName: lastName }, { where: { id: userid } })
    .then((changes: number[]) => {
      res.status(200);
      res.send(changes[0] == 1 ? "updated" : "not updated");
    })
    .catch((err: any) => {
      console.log(err);
      res.sendStatus(500);
    });
});
app.post("/uploadUserImage", multer({ dest: "usersImages" }).single("filedata"), function (req: Request, res: Response) {
  if (!req.body) return res.sendStatus(400);
  const userid = req.query.id;
  console.log(userid);

  let filedata = req.file;
  console.log(filedata);
  if (!filedata) {
    res.status(400);
    res.send("file not uploaded");
  }
  else {
    let binImage;
    fs.readFile(filedata.path, (err:any, data:string) => {
      if (err) {
        console.error(err);
        return  res.sendStatus(500);;
      }
      binImage = data; 
      User.update({ image: binImage }, { where: { id: userid } })
      .then((changes: number[]) => {
        console.log(`changes: ${changes}`)
        res.status(200);
        res.send(changes[0] == 1 ? "updated" : "not updated");
        if (filedata) fs.unlinkSync(filedata.path);
      })
      .catch((err: any) => {
        console.log(err);
        res.sendStatus(500);
      });     
    });
   
  }
});
app.post("/deleteUser", function (req: Request, res: Response) {
  if (!req.body) return res.sendStatus(400);
  const userid = req.query.id;
  User.destroy({ where: { id: userid } })
    .then((changes: number) => {
      res.status(200);
      console.log(changes);
      res.send(changes == 1 ? "deleted" : "not deleted");
    })
    .catch((err: any) => {
      console.log(err);
      res.sendStatus(500);
    });
});