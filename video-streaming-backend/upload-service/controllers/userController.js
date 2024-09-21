import { getUserdetails } from "../models/authModel.js";

export const getUserDetails = async (req, res) => {
  let { email } = req.query;
  const UserDetails = await getUserdetails(email);
  res.status(200).json({ ...UserDetails });
};
