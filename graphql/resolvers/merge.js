import Tag from "../../models/tag";
import Recipe from "../../models/recipe";
import Category from "../../models/category";

//functions for merging together data based on their relationships

export const enrichCategory = async (category) => ({
  ...category._doc,
  recipes: () => findRecipesByIds(category._doc.recipes),
});

export const enrichTag = async (tag) => ({
  ...tag._doc,
  recipes: () => findRecipesByIds(tag._doc.recipes),
});

export const enrichRecipe = async (recipe) => ({
  ...recipe._doc,
  tags: () => recipe._doc.tags.map((tag) => findTagById(tag)),
  category: () => findCategoryById,
});

const findTagById = async (tagId) => {
  const tag = await Tag.findById(tagId);
  return enrichTag(tag);
};

// const findRecipeById = async (recipeId) => {
//   const recipe = await Recipe.findById(recipeId);
//   return enrichRecipe(recipe);
// };

const findRecipesByIds = async (recipeIds) => {
  const recipes = await Recipe.find({ _id: { $in: recipeIds } });
  return recipes.map((recipe) => enrichRecipe(recipe));
};

const findCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  return enrichCategory(category);
};
