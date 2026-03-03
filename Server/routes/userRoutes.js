import express from "express";
import userAuth from "../middlewear/userAuth.js";
import { getUserData } from "../controllers/userController.js";


const userRouter = express.Router();

userRouter.get('/data', userAuth,getUserData);

export default userRouter;