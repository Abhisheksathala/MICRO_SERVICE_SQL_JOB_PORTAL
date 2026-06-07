import express, { Router } from "express";
import { registerUser } from "../controllers/auth.js";
import { UploadFile } from "../middleware/multer.js";


const AuthRouter: Router = express.Router();



AuthRouter.post('/register', UploadFile, registerUser)


export default AuthRouter;