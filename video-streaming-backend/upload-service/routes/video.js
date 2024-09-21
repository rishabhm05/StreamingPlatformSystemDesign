import express from 'express';
import { getAllVideos } from '../controllers/videoController.js';
const videoRouter = express.Router();
videoRouter.get("/",getAllVideos)
export default videoRouter;