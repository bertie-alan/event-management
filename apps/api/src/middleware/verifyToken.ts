import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { redisClient } from "../helpers/redis";

declare global {
    namespace Express {
        interface Request {
            dataUser: any
        }
    }
}

export const verifyToken = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        
        if (!token) {
            return res.status(400).send("Token not found");
        }

        const redisCheckToken = await redisClient.get(`forgotPasswordRedis:${req.body.email}`);
        console.log(token, redisCheckToken, "lalala");
        
        if (token === redisCheckToken) {
            const verifiedToken = verify(token, "flint123");

            req.dataUser = verifiedToken;
            next();
        } else {
            return res.status(401).send("Token is invalid or expired");
        }

    } catch (error: any) {
        return res.status(400).send("Token error");
    }
}