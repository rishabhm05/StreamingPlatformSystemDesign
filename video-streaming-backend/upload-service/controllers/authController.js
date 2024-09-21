import dotenv from 'dotenv'
dotenv.config()
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { checkUser, createUser } from "../models/authModel.js";

const JWT_KEY = process.env.JWT_KEY;
export const auth = async (req, res) => {
  const client = new OAuth2Client(
    //"213728720951-u2aqgj2i7e0f97j7i0491j9f0gig0otr.apps.googleusercontent.com"
    process.env.GOOGLE_CLIENT_ID
  );
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:process.env.GOOGLE_CLIENT_ID
        //"213728720951-u2aqgj2i7e0f97j7i0491j9f0gig0otr.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const userid = payload["email"];
    const jwttoken = jwt.sign({ email: userid }, JWT_KEY, { expiresIn: "24h" });
    // Check if user already exists or not
    const userExists = await checkUser(userid);
    if (!userExists) {
      const newUser = await createUser(
        userid,
        payload["name"],
        payload["picture"]
      );
    }

    res.status(201).json({
      "jwt-token": jwttoken,
    });
  } catch (err) {
    console.log(err)
    return res.status(401).json({ msg: "Token Expired." });
  }
};
