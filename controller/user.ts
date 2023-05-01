import { Request, Response } from 'express';
import { WriteStream } from 'fs';
const fs = require('fs');
const PDFDocument = require('pdfkit');
import User from '../models/user';


export default class UserController {
  static users (req: Request, res: Response) {
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
  }
  static user (req: Request, res: Response) {
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
  } 
  static createUser (req: Request, res: Response) {
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
  }
  static editUser (req: Request, res: Response) {
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
  }
  static uploadUserImage (req: Request, res: Response) {
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
  }
  static deleteUser (req: Request, res: Response) {
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
  }
  static generatePdf (req: Request, res: Response) {
    if (!req.body) return res.sendStatus(400);
    const email = req.query.email;
    User.findOne({ where: { email: email } })
      .then((user: User) => {
        if (!user) return res.sendStatus(404);
        //if (user.pdf) return res.send({ result: true });
        UserController.generatePdfFile(user)
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
  }
  private static generatePdfFile(user: User): Promise<string> {
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
}