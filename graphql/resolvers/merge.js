import Tag from "../../models/tagModel.js";
import Recipe from "../../models/recipeModel.js";
import Category from "../../models/categoryModel.js";
import Dietary from "../../models/dietaryModel.js";

//functions for merging together data based on their relationships

export const enrichCategory = async (category) => ({
  ...category._doc,
  recipes: () => findRecipesByIds(category._doc.recipes),
});

export const enrichTag = async (tag) => ({
  ...tag._doc,
  recipes: () => findRecipesByIds(tag._doc.recipes),
});

export const enrichDietary = async (dietary) => ({
  ...dietary._doc,
  recipes: () => findRecipesByIds(dietary._doc.recipes),
});

export const enrichRecipe = async (recipe) => ({
  ...recipe._doc,
  tags: () => findTagsByIds(recipe._doc.tags),
  category: () => findCategoryById(recipe._doc.category),
  dietaries: () => findDietariesByIds(recipe._doc.dietaries),
  author: () => enrichUser(recipe._doc.author),
});

export const enrichUser = (user) => ({
  ...user._doc,
  password: null, // obscure password hash
  recipes: () => findRecipesByIds(user._doc.recipes),
});

// fetch related documents from the database

const findTagsByIds = async (tagIds) => {
  const tags = await Tag.find({ _id: { $in: tagIds } });
  return tags.map((tag) => enrichTag(tag));
};

const findRecipesByIds = async (recipeIds) => {
  const recipes = await Recipe.find({ _id: { $in: recipeIds } });
  return recipes.map((recipe) => enrichRecipe(recipe));
};

const findCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  return enrichCategory(category);
};

const findDietariesByIds = async (dietaryIds) => {
  const dietaries = await Dietary.find({ _id: { $in: dietaryIds } });
  return dietaries.map((dietary) => enrichDietary(dietary));
};
