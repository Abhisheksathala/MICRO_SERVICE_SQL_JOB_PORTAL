import express, { Router } from "express";
import { registerUser, loginuser } from "../controllers/auth.js";
import { UploadFile } from "../middleware/multer.js";
import { forgetpassword } from "../controllers/Frogetpassword.js";


const AuthRouter: Router = express.Router();



AuthRouter.post('/register', UploadFile, registerUser)
AuthRouter.post('/login', loginuser)
AuthRouter.post('/forget-password', forgetpassword)


export default AuthRouter;