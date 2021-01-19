import Recipe from "../../models/recipeModel.js";
import Tag from "../../models/tagModel.js";
import Category from "../../models/categoryModel.js";
import Dietary from "../../models/dietaryModel.js";
import { enrichRecipe } from "./merge.js";
import { roles } from "../accessControl.js";

export const recipes = async (args, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }

  const recipes = await Recipe.find();
  return recipes.map((recipe) => enrichRecipe(recipe));
};

export const createRecipe = async (args, req) => {
  // access control
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }
  if (req.userRole === roles.reader) {
    throw new Error("Readers may not create recipes.");
  }

  const { tags: tagNames } = args.recipeInput;

  let tagIds;
  if (tagNames) {
    tagIds = await Promise.all(tagNames.map(getOrCreateTag));
  }

  // create the recipe
  const newRecipe = await new Recipe({
    ...args.recipeInput,
    author: req.userId,
    tags: tagIds,
  }).save();
  await addRecipeLinks(newRecipe);
  return enrichRecipe(newRecipe);
};

export const deleteRecipe = async (args, req) => {
  const { recipeId } = args;
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }
  if (req.userRole === roles.reader) {
    throw new Error("Readers may not delete recipes.");
  }
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new Error("Recipe not found.");
  }
  if (req.userRole === roles.contributor) {
    if (req.userId !== recipe._doc._id) {
      throw new Error("Contributors may only delete their own recipes");
    }
  }

  const deletedRecipe = await recipe.delete();
  await removeRecipeLinks(deletedRecipe);
  return enrichRecipe(deletedRecipe);
};

export const updateRecipe = async (args, req) => {
  const { recipeId, recipeInput } = args;
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }
  if (req.userRole === roles.reader) {
    throw new Error("Readers may not modify recipes.");
  }
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new Error("Recipe not found.");
  }
  if (req.userRole === roles.contributor) {
    if (req.userId !== recipe._id) {
      throw new Error("Contributors may only modify their own recipes");
    }
  }

  // remove existing document links
  await removeRecipeLinks(recipe);

  // tag names to tag ids
  const { tags: tagNames, ...fieldsToUpdate } = recipeInput;
  let tagIds;
  if (tagNames) {
    tagIds = await Promise.all(tagNames.map(getOrCreateTag));
  }
  fieldsToUpdate.tags = tagIds;

  // update document fields
  Object.keys(fieldsToUpdate).forEach((fieldName) => {
    if (fieldName) {
      recipe[fieldName] = fieldsToUpdate[fieldName];
    }
  });
  const updatedRecipe = await recipe.save();

  await addRecipeLinks(updatedRecipe);

  return enrichRecipe(updatedRecipe);
};

// helper functions

const addRecipeLinks = async (recipe) => {
  const {
    _id: recipeId,
    category: categoryId,
    tags: tagIds,
    dietaries: dietaryIds,
  } = recipe;

  // get the related documents
  const [category, tags, dietaries] = await Promise.all([
    Category.findById(categoryId),
    Promise.all(tagIds.map((tag) => Tag.findById(tag))),
    Promise.all(dietaryIds.map((dietary) => Dietary.findById(dietary))),
  ]);

  // add the recipeId into the related documents recipe arrays
  category.recipes.push(recipeId);
  tags.map((tag) => tag.recipes.push(recipeId));
  dietaries.map((dietary) => dietary.recipes.push(recipeId));

  return await Promise.all([
    category.save(),
    Promise.all(tags.map((tag) => tag.save())),
    Promise.all(dietaries.map((dietary) => dietary.save())),
  ]);
};

const removeRecipeLinks = async (recipe) => {
  const {
    _id: recipeId,
    category: categoryId,
    tags: tagIds,
    dietaries: dietaryIds,
  } = recipe;

  // get the related documents
  const [category, tags, dietaries] = await Promise.all([
    Category.findById(categoryId),
    Promise.all(tagIds.map((tag) => Tag.findById(tag))),
    Promise.all(dietaryIds.map((dietary) => Dietary.findById(dietary))),
  ]);

  // remove the recipeId from all the related documents recipe arrays
  const filterFunc = (id) => id !== recipeId;
  category.recipes = category.recipes.filter(filterFunc);
  tags.forEach((tag) => {
    tag.recipes = tag.recipes.filter(filterFunc);
  });
  dietaries.forEach((dietary) => {
    dietary.recipes = dietary.recipes.filter(filterFunc);
  });

  return await Promise.all([
    category.save(),
    Promise.all(tags.map((tag) => tag.save())),
    Promise.all(dietaries.map((dietary) => dietary.save())),
  ]);
};

const getOrCreateTag = async (name) => {
  let tag = await Tag.findOne({ name }).collation({
    locale: "en",
    strength: 1,
  });
  if (!tag) {
    const newTag = new Tag({ name, recipes: [] });
    tag = await newTag.save();
  }
  return tag;
};
