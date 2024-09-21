import jwt from "jsonwebtoken";
const JWT_KEY = "JWT_SECRET_KEY";
export const VerifyToken = (req, res, next) => {
  const authtoken =
    req.headers["x-auth"] && req.headers["x-auth"].split(" ")[1];
  if (!authtoken)
    return res.status(401).json({ message: "Unauthorized access" });
  jwt.verify(authtoken, JWT_KEY, (err, userDetails) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden access" });
    } else {
      req.query.email = userDetails["email"];
      next();
    }
  });
};
