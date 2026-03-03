import express from "express";
import { register, login, logout,sendverifyotp,verifyEmail, isAuthenticated, sendresetotp, resetpassword } from "../controllers/authController.js";
import userAuth from "../middlewear/userAuth.js";

const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth, sendverifyotp);
authRouter.post('/verify-account',userAuth,verifyEmail);
authRouter.get('/is-auth',userAuth,isAuthenticated);
authRouter.post('/send-reset-otp',sendresetotp);
authRouter.post('/reset-password',resetpassword);

export default authRouter;