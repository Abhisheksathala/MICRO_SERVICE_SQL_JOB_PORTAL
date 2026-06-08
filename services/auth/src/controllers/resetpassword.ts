import type { Request, Response, NextFunction, RequestHandler } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../db/db.js";
import jwt, { JsonWebTokenError } from "jsonwebtoken";



export const resetpassword: RequestHandler = TryCatch(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const { token } = req.params as { token: string };
    const { password } = req.body;

    if (!token) {
        throw new ErrorHandler("Token is required", 400)
    }

    if (!password) {
        throw new ErrorHandler("Password is required", 400)
    }

    let decoded: unknown;

    try {

        decoded = jwt.verify(token, process.env.JWT_SECRET!)

    } catch (error) {
        throw new ErrorHandler("Invalid token", 400)
    }




})