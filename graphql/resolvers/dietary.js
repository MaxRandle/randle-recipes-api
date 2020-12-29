import Dietary from "../../models/dietaryModel.js";
import { enrichDietary } from "./merge.js";

export const dietaries = async (args, req) => {
  const dietaries = await Dietary.find();
  return dietaries.map((dietary) => enrichDietary(dietary));
};

export const createDietary = async ({ name }, req) => {
  const newDietary = new Dietary({
    name,
    recipes: [],
  });
  const createdDietary = await newDietary.save();
  return enrichDietary(createdDietary);
};
