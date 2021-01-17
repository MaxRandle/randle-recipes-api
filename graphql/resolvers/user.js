import bcrypt from "bcryptjs";
import User from "../../models/userModel.js";
import { enrichUser } from "./merge.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtSecretString = process.env.JWT_SECRET_STRING;

export const users = async (args, req) => {
  const users = await User.find();
  return users.map((user) => enrichUser(user));
};

export const createUser = async (args) => {
  const { email, password, name } = args.userInput;

  // check username exists already
  const user = await User.findOne({ email });
  if (user) {
    throw new Error("Email is already in use.");
  }

  // generate password hash
  const passwordHash = bcrypt.hashSync(
    password, // plaintext password
    12 // number of rounds of salting
  );

  // create the new user
  const newUser = new User({
    email,
    password: passwordHash,
    name,
    role: "Contributor",
    recipes: [],
  });
  // save user as a document in the users collection
  const createdUser = await newUser.save();

  return enrichUser(createdUser);
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User does not exist");
  }

  // check password hash matches
  const isPasswordMatch = await bcrypt.compareSync(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid credentials.");
  }

  const tokenExpiresIn = 72; // hours

  // generate a token
  const token = jwt.sign(
    { userId: user.id, userEmail: user.email, userRole: user.role },
    jwtSecretString,
    { expiresIn: `${tokenExpiresIn}h` }
  );

  return {
    user: () => enrichUser(user),
    token,
    tokenExpiration: tokenExpiresIn,
  };
};

export const verifyJwt = async (args, req) => {
  if (!req.isAuth) {
    throw new Error("Invalid Token");
  }

  const user = await User.findById(req.userId);

  return enrichUser(user);
};
