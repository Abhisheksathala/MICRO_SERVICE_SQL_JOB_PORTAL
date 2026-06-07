import express, { Router } from "express";
import { registerUser } from "../controllers/auth.js";


const AuthRouter:Router = express.Router();



AuthRouter.post('/register',registerUser)


export default AuthRouter;