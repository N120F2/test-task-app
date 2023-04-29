//external modules
import express, { Express, Request, Response } from 'express';
const multer = require("multer");
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const dotenv = require('dotenv').config();
//my modules
const Database = require('./database');
import AuthController from './controller/auth';
import UserController from './controller/user';
import Admin from './models/admin';

//config envs
const port = process.env.PORT || 8081;
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_JWT_KEY
}
//folders
const fs = require('fs');
const imageFolderName:string = "usersImages";
if (!fs.existsSync(imageFolderName)){
  fs.mkdirSync(imageFolderName);
}
const PDFFolderName:string = "pdfs"; 
if (!fs.existsSync(PDFFolderName)){
  fs.mkdirSync(PDFFolderName);
}

//app
const app: Express = express();
const urlencodedParser = express.urlencoded({ extended: false });
app.use(urlencodedParser);
//jwt
app.use(passport.initialize());
((passport: any) => {
  passport.use(
    new JwtStrategy(options, async (payload: any, done: any) => {
      try {
        const admin = await Admin.findOne({ where: { id: payload.userId } });
        if (admin) {
          done(null, admin);
        } else {
          done(null, false);
        }
      } catch (e) {
        console.log(e)
      }
    })
  )
})(passport)

//connect to db and start server
Database.sequelize.sync()
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
app.get("/users", passport.authenticate('jwt', { session: false }), UserController.users);
app.get("/user", passport.authenticate('jwt', { session: false }), UserController.user);
app.post("/createUser", passport.authenticate('jwt', { session: false }), UserController.createUser);
app.post("/editUser", passport.authenticate('jwt', { session: false }), UserController.editUser);
app.post("/uploadUserImage",
  passport.authenticate('jwt', { session: false }),
  multer({ dest: "usersImages" }).single("filedata"),
  UserController.uploadUserImage);
app.post("/deleteUser", passport.authenticate('jwt', { session: false }), UserController.deleteUser);
app.post("/generatePdf", passport.authenticate('jwt', { session: false }), UserController.generatePdf);
//admins
app.post("/login", AuthController.login);
app.post("/reg", AuthController.reg);