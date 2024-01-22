import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";


export const regisValidation = [
    body("username").notEmpty().withMessage("Please enter your username"),
    body("email").notEmpty().withMessage("Please enter your email"),
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password").notEmpty().withMessage("Please enter your password"),

    (req:  Request, res: Response, next: NextFunction) => {
        const errorValidator = validationResult(req);

        if (!errorValidator.isEmpty()) {
            return res.status(400).send({ error: errorValidator.array() });
        }

        next();
    }
]