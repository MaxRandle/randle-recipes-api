import Dietary from "../../models/dietaryModel.js";
import { roles } from "../accessControl.js";
import { enrichDietary } from "./merge.js";

export const dietaries = async (args, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }

  const dietaries = await Dietary.find();
  return dietaries.map((dietary) => enrichDietary(dietary));
};

export const createDietary = async ({ name }, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (req.userRole !== roles.admin) {
    throw new Error("You are not authorized to perform that action.");
  }

  const newDietary = new Dietary({
    name,
    recipes: [],
  });
  const createdDietary = await newDietary.save();
  return enrichDietary(createdDietary);
};
