import { Request, Response } from 'express';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import Admin from '../models/admin';
const generateAccessToken = (id: number, login: string) => {
  const payload = {
    userId: id,
    login: login
  }
  return jwt.sign(payload, process.env.SECRET_JWT_KEY, { expiresIn: "1h" })
}
export default class AuthController {
  static login(req: Request, res: Response) {
    const { login, password } = req.query;
    Admin.findOne({ where: { login: login } })
      .then((admin: Admin) => {
        if (!admin) return res.sendStatus(404);
        const validPassword = bcrypt.compareSync(password, admin.password)
        if (!validPassword) {
          return res.sendStatus(403);
        }
        const token = generateAccessToken(admin.id, admin.login);
        return res.json({ token })
      })
      .catch((err: any) => {
        console.log(err)
        res.status(400).json({ message: 'Login error' })
      });
  }
  static reg(req: Request, res: Response) {
    if (!req.body) return res.sendStatus(400);    
    const login = req.query.login;
    const password = req.query.password;
    if(!password || !login) return res.sendStatus(400);
    bcrypt.hash(password, 10, function (err: Error, hash: string) {      
      Admin.create({ login: login, password: hash })
        .then((admin: Admin) => {
          res.status(201).json({ id: admin.id })
        })
        .catch((err: any) => {
          console.log(err);
          res.sendStatus(400);
        });
    });
  }
}