import Recipe from "../../models/recipeModel.js";
import { enrichRecipe } from "./merge.js";

export const recipes = async (args, req) => {
  const recipes = await Recipe.find();
  return recipes.map((recipe) => enrichRecipe(recipe));
};
