import type { Request, Response, NextFunction, RequestHandler } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../db/db.js";
import bcrypt from "bcryptjs";
import getbuffer from "../utils/buffer.js";
import axios from "axios";
import jwt from "jsonwebtoken"



export const createToken = (user_id: string) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRET!, { expiresIn: "15d" })
}


export const registerUser: RequestHandler = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

  const { name, email, password, phoneNumber, role, bio } = req.body;

  if (!name || !email || !password || !phoneNumber || !role) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existingUser = await sql`
  SELECT user_id FROM users WHERE email = ${email}
  `
  if (existingUser.length > 0) {
    throw new ErrorHandler("User already exists", 409);
  }

  const hash = await bcrypt.hash(password, 10)

  let registerUser;

  if (role === 'recruiter') {

    const [user] = await sql`
    INSERT INTO users (name,email,password,phone_number,role) VALUES (${name},${email},${hash},${phoneNumber},${role}) RETURNING user_id,name,email,phone_number,role,created_at`
    registerUser = user;

  } else if (role === 'jobseeker') {

    const file = req.file;
    if (!file) {
      throw new ErrorHandler("File is required", 400)
    }
    const filebuffer = getbuffer(file);
    if (!filebuffer || !filebuffer.content) {
      throw new ErrorHandler("Failed to buffer file", 500)
    }
    const { data } = await axios.post(`${process.env.UPLOADE_SERVICE}/api/utils/upload`, { buffer: filebuffer.content, public_id: file.originalname })

    const [user] = await sql`
    INSERT INTO users (name,email,password,phone_number,role,bio,resume,resume_public_id) VALUES (${name},${email},${hash},${phoneNumber},${role},${bio},${data.url},${data.public_id}) RETURNING user_id,name,email,phone_number,role,bio,resume,resume_public_id,created_at`

    registerUser = user;
  }

  const token = createToken(registerUser?.user_id);

  return res
    .status(201)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000
    })
    .json({
      success: true,
      message: "User registered successfully",
      accessToken: token,
      data: registerUser
    })
})


export const loginuser: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler("All fields are required", 400);
  }


  //  const user = await sql`SELECT * FROM users WHERE email = ${email}`

  const user = await sql`SELECT u.user_id ,u.email,u.password,u.phone_number,u.name,u.role,u.bio,u.resume,u.profile_pic,u.subscribtion,
    ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.email = ${email} GROUP BY u.user_id;`


  if (user.length === 0 && !user) {
    throw new ErrorHandler("User not found", 404);
  }

  const userObj: any = user[0];

  const validPassword = await bcrypt.compare(password, userObj?.password);

  if (!validPassword) {
    throw new ErrorHandler("Invalid password", 401);
  }

  const token = createToken(userObj?.user_id);

  userObj.skills = userObj.skills || []

  delete userObj.password;

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000
    })
    .json({
      success: true,
      message: "User logged in successfully",
      accessToken: token,
      data: userObj
    })
})