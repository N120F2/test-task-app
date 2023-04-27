import express, { Express, Request, Response } from 'express';
import { WriteStream } from 'fs';
const { Sequelize, Model, DataTypes } = require('sequelize');
const fs = require('fs');
const multer = require("multer");
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');
const Database = require('./database');
const AuthController = require('./controller/auth');

const passport = require('passport')
//jwt middleware
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


//config evs
dotenv.config();
const port = process.env.PORT || 8081;
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_JWT_KEY
}
//database
Database.init();
const sequelize = Database.sequelize;
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
interface IUser {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  image: Buffer,
  pdf: BinaryData
}
//admins
const Admin = sequelize.define("admin", {
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
});

//app
const app: Express = express();
const urlencodedParser = express.urlencoded({ extended: false });
app.use(urlencodedParser);
//jwt
app.use(passport.initialize());
((passport: any) => {
  passport.use(
      new JwtStrategy(options, async (payload :any, done:any) => {
          try {
            const admin = await Admin.findOne({ where: { id: payload.userId } });
              if(admin) {
                  done(null, admin);
              } else {
                  done(null, false);
              }
          } catch(e) {
              console.log(e)
          }
          
      })
  )
})(passport)

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
app.get("/users",passport.authenticate('jwt', {session: false}), function (req: Request, res: Response) {
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
app.post("/uploadUserImage",passport.authenticate('jwt', {session: false}), multer({ dest: "usersImages" }).single("filedata"), function (req: Request, res: Response) {
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

    //!!!!!!!!!!sync
    fs.readFile(filedata.path, (err: any, data: string) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);;
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
app.post("/generatePdf", function (req: Request, res: Response) {
  if (!req.body) return res.sendStatus(400);
  const email = req.query.email;
  User.findOne({ where: { email: email } })
    .then((user: IUser) => {
      if (!user) return res.sendStatus(404);
      if (user.pdf) return res.send({ result: true });
      generatePdf(user)
        .then((path: string) => {

          fs.readFile(path, (err: any, binPdf: string) => {
            if (err) {
              console.error(err);
              return res.sendStatus(500);;
            }
            User.update({ pdf: binPdf }, { where: { email: email } })
              .then((changes: number[]) => {
                console.log(`changes: ${changes}`)
                res.status(200);
                res.send({ result: true });
                fs.unlinkSync(path);
              })
              .catch((err: any) => {
                console.log(err);
                res.sendStatus(500);
              });
          });

        }).catch((err: any) => {
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch((err: any) => {
      console.log(err);
      res.sendStatus(500);
    });
});
function generatePdf(user: IUser): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LEGAL',
        info: {
          Title: user.firstName,
        }
      });
      let pdfFile: string = `pdfs/${user.id}.pdf`;
      let pdfStream: WriteStream = fs.createWriteStream(pdfFile);

      let content: string = `First Name: ${user.firstName} Last Name: ${user.lastName}`;

      doc
        .fontSize(15)
        .text(content, {
          continued: true
        })
      doc.moveDown();

      if (user.image) {
        fs.writeFileSync(`usersImages/${user.id}.jpg`, user.image as Buffer)
        doc.image(`usersImages/${user.id}.jpg`, {
          align: 'center',
          valign: 'center'
        });
        fs.unlinkSync(`usersImages/${user.id}.jpg`);
      }


      doc.pipe(pdfStream);
      doc.end();

      pdfStream.addListener('finish', function () {
        resolve(`pdfs/${user.id}.pdf`);
      });
    } catch (err: any) {
      console.error('MakePDF ERROR: ' + err.message);
      reject("Error");
    }

  })

}
app.post("/login", AuthController.login);