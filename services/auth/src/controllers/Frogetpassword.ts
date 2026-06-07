import type { Request, Response, NextFunction, RequestHandler } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../db/db.js";
import { createToken } from "./auth.js";
import { ForgetPasswordTemplate } from "./Templets.js";
import { PublishToTopic } from "../producer.js";





export const forgetpassword: RequestHandler = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

  const { email } = req.body;

  if (!email) {
    throw new ErrorHandler("Please provide email", 400)
  }


  const [users] = await sql`SELECT user_id FROM users WHERE email = ${email}`

  if (users?.length === 0 && !users) {
    throw new ErrorHandler("User not found", 404)
  }


  const user = users?.[0];

  const resetToken = createToken(user?.user_id);

  const resetLink = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

  const messageBody = {
    to: email,
    subject: "Reset your Password - hirehere",
    html: ForgetPasswordTemplate(email, resetLink)   // publish to the send mail topic
  }

  await PublishToTopic("send-mail", messageBody).catch((err: any) => {
    console.log(err?.message, "failed to send email")
  })

  return res
    .status(200)
    .cookie("resetToken", resetToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000,
      sameSite: "strict",
    })
    .json({
      success: true,
      message: "Password reset link sent successfully",
      data: messageBody
    })
})

//TODO: Implement the reset password controller and Redis 3:21