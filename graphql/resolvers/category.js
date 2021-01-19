import Category from "../../models/categoryModel.js";
import { roles } from "../accessControl.js";
import { enrichCategory } from "./merge.js";

export const categories = async (args, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }

  const categories = await Category.find();
  return categories.map((category) => enrichCategory(category));
};

export const createCategory = async ({ name }, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (!req.userRole !== roles.admin) {
    throw new Error("You are not authorized to perform that action.");
  }

  const newCategory = new Category({
    name,
    recipes: [],
  });
  const createdCategory = await newCategory.save();
  return enrichCategory(createdCategory);
};
