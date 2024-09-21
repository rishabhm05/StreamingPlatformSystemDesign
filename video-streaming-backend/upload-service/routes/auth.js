import express from "express";
import { auth } from "../controllers/authController.js";
const authRouter = express.Router();
authRouter.post("/google", auth);
export default authRouter;
