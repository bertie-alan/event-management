import { Request, Response, NextFunction } from "express";
import { compare, genSalt, hash } from "bcrypt";
import prisma from "@/prisma";
import { sign } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { transporter } from "@/helpers/nodemailer";
import { redisClient } from "@/helpers/redis";

export class AuthController {
    async registerUser (req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password, gender, role } = req.body;
            const checkUser = await prisma.user.findUnique({
                where: { email }
            });

            if (checkUser) {
                throw new Error("Email has been taken, please use another email.")
            }

            const salt = await genSalt(10);
            const hashPassword = await hash(password, salt);

            const newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    password : hashPassword,
                    gender,
                    role
                }
            });

            return res.status(201).send({
                success: true,
                result: newUser
            });

        } catch (error: any) {
            console.log(error);
            next(error);
        }

    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            const checkUser = await prisma.user.findUnique({
                where: { email }
            })

            if (checkUser) {
                const token = sign({
                    id: checkUser?.id,
                    role: checkUser?.role,
                    email: checkUser?.email,
                    username: checkUser?.username
                }, "flint123");
                
                console.log(token);
                
                await redisClient.setEx(`forgotPasswordRedis:${req.body.email}`, 3600, token)
                
                //generate email nodemailer
                const templateMail = path.join(__dirname, "../templates", "forgotpassword.hbs");
                const templateSource = fs.readFileSync(templateMail, "utf-8");
                const compileTemplate = handlebars.compile(templateSource);
                
                await transporter.sendMail({
                    from: "Ticket Management Website",
                    to: email,
                    subject: "Your password reset request",
                    html: compileTemplate({ url: `http://localhost:8000/reset-password?token=${token}` })
                })


                return res.status(200).send({
                    success: true,
                    message: "To continue reset your password, check your email"
                })
            } else {
                throw new Error("Please re-type your email address, your current email does not exist in our database")
            }
        } catch (error: any) {
            console.log(error);
            next(error);
        }
    }


    async updatePassword (req: Request, res: Response, next: NextFunction) {
        try {            
            const { email, oldPassword, newPassword } = req.body;

            const checkUser = await prisma.user.findUnique({
                where: { email }
            });

            if (!checkUser) {
                return res.status(400).send("User not exist");
            }

            //check old password from req.body, compares with current password
            const isValidPassword = await compare(oldPassword, checkUser?.password);

            if (!isValidPassword) {
                return res.status(401).send("[INVALID] old password");
            }

            //update password (updatePass) with newPassword
            const salt = await genSalt(10);
            const hashNewPassword = await hash(newPassword, salt);
            const updatePass = await prisma.user.update({
                where: { email },
                data: {
                    password: hashNewPassword
                }
            });

            return res.status(200).send({
                
                success: true,
                result: updatePass
            })

        } catch (error: any) {
            console.log(error);
            next(error);
        }
    }

    

}