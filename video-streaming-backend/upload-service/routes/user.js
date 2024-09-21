import express from 'express';
import { getUserDetails } from '../controllers/userController.js';
const userRouter = express.Router();
userRouter.get('/',getUserDetails)
export default userRouter;