import express from 'express';
import multer from 'multer';
import { completeMultipartUpload, initiateMultipartUpload, uploadPart } from '../controllers/uploadController.js';
const videoUpload = multer();
const uploadRouter = express.Router();
uploadRouter.post("/initiateMultipartUpload",videoUpload.none() ,initiateMultipartUpload);
uploadRouter.post("/uploadPart",videoUpload.single('chunk') ,uploadPart);
uploadRouter.post("/completeMultipartUpload",completeMultipartUpload);
export default uploadRouter;