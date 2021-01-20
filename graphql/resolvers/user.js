import bcrypt from "bcryptjs";
import User from "../../models/userModel.js";
import { enrichUser } from "./merge.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { roles } from "../accessControl.js";
import { nanoid } from "nanoid";
dotenv.config();

const jwtSecretString = process.env.JWT_SECRET_STRING;

export const users = async (args, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }

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
    role: roles.reader, // default role is reader
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
    throw new Error("Invalid token.");
  }

  const user = await User.findById(req.userId);

  return enrichUser(user);
};

export const setUserRole = async (args, req) => {
  const { userId, role } = args;
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (req.userRole !== roles.admin) {
    throw new Error("You are not authorized to perform that action.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }
  user.role = role;
  await user.save();

  return enrichUser(user);
};

export const resetUserPassword = async (args, req) => {
  const { userId } = args;

  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (req.userRole !== roles.admin) {
    throw new Error("You are not authorized to perform that action.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // generate a password
  const newPassword = nanoid(6).toLowerCase();
  // generate the new hash
  const passwordHash = bcrypt.hashSync(newPassword, 12);
  // update the user with new hash
  user.password = passwordHash;
  await user.save();

  return newPassword;
};

export const changeUserPassword = async (args, req) => {
  const { currentPassword, newPassword } = args;
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }

  const user = await User.findById(req.userId);

  // check password hash matches
  const isPasswordMatch = await bcrypt.compareSync(
    currentPassword,
    user.password
  );
  if (!isPasswordMatch) {
    throw new Error("The current password was incorrect.");
  }

  // generate new password hash
  const passwordHash = bcrypt.hashSync(newPassword, 12);
  // update the user with new hash
  user.password = passwordHash;
  await user.save();

  return enrichUser(user);
};
