import express, { Express, Request, Response } from 'express';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../database');
const generateAccessToken = (id: number, login: string) => {
    const payload = {
        userId: id,
        login: login
    }
    return jwt.sign(payload, process.env.SECRET_JWT_KEY, {expiresIn: "1h"})
}
export default class AuthController {
    static async login (req: Request, res: Response) {
        try {
          const { login, password } = req.query
          console.log(login +" "+ password);
          const Admin = Database.sequelize.model("admin");
          const admin = await Admin.findOne({ where: { login: login } })
          if (!admin) {
            return res.json({ message: 'Login error', code: 2 })
          }
          const validPassword = bcrypt.compareSync(password, admin.password)
          if (!validPassword) {
            return res.json({ message: 'Password error', code: 2 })
          }
          const token = generateAccessToken(admin.id, admin.login);
          return res.json({ token })
        } catch (e) {
          console.log(e)
          res.status(400).json({ message: 'Login error' })
        }  
      }
}
//module.exports = AuthController;