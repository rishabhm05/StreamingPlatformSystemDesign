import express from "express";
import cors from 'cors';
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import { VerifyToken } from "./middlewares/authMiddleWare.js";
import uploadRouter from "./routes/upload.js";
import videoRouter from "./routes/video.js";
const PORT = process.env.PORT || 3000;
var whitelist = ['http://localhost:5173','http://localhost:5174']
var corsOptions = {
  origin: function (origin, callback) {
    if (!origin||whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}
console.log(process.env.GOOGLE_CLIENT_ID)
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use("/auth", authRouter);
app.use("/user", VerifyToken, userRouter);
app.use("/upload" ,VerifyToken,uploadRouter);
app.use("/videos",videoRouter)
app.listen(PORT, () => {
  console.log(`Upload Service Running on Port ${PORT}`);
});
