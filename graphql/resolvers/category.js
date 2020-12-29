import Category from "../../models/categoryModel.js";
import { enrichCategory } from "./merge.js";

export const categories = async (args, req) => {
  const categories = await Category.find();
  return categories.map((category) => enrichCategory(category));
};

export const createCategory = async ({ name }, req) => {
  const newCategory = new Category({
    name,
    recipes: [],
  });
  const createdCategory = await newCategory.save();
  return enrichCategory(createdCategory);
};
