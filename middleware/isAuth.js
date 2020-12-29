import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtSecretString = process.env.JWT_SECRET_STRING;

const isAuth = () => (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }

  let decryptedToken;
  try {
    decryptedToken = jwt.verify(token, jwtSecretString);
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  console.log(decryptedToken);

  if (!decryptedToken) {
    req.isAuth = false;
    return next();
  }

  req.isAuth = true;
  req.userId = decryptedToken.userId;
  next();
};

export default isAuth;
