import Tag from "../../models/tagModel.js";
import Recipe from "../../models/recipeModel.js";
import Category from "../../models/categoryModel.js";
import Dietary from "../../models/dietaryModel.js";
import User from "../../models/userModel.js";

// functions for merging together data based on their relationships

// every document that is sent out must be passed through an enrich function
// the enrich functions have 3 jobs:
// populate links within a document with the document that they are referencing
// map some database types into more easily consumable ones
// sterilise document of any sensitive data before it is sent out

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
  author: () => findUserById(recipe._doc.author),
  createdAt: dbDateToIsoString(recipe._doc.createdAt),
  updatedAt: dbDateToIsoString(recipe._doc.updatedAt),
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

const findUserById = async (userId) => {
  const user = await User.findById(userId);
  return enrichUser(user);
};

// helper functions

const dbDateToIsoString = (date) => new Date(date).toISOString();
