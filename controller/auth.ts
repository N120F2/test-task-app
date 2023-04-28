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
}