import Recipe from "../../models/recipeModel.js";
import Tag from "../../models/tagModel.js";
import Category from "../../models/categoryModel.js";
import Dietary from "../../models/dietaryModel.js";
import { enrichRecipe } from "./merge.js";
import { roles } from "../accessControl.js";

export const recipes = async (args, req) => {
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

  const newRecipe = new Recipe({
    ...args.recipeInput,
    author: req.userId,
    tags: [],
  });

  const createdRecipe = await newRecipe.save();

  const updatedRecipe = await addRecipeLinks(
    createdRecipe,
    createdRecipe.category,
    tagNames,
    createdRecipe.dietaries
  );

  return enrichRecipe(updatedRecipe);
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

  await removeRecipeLinks(recipe);
  const deletedRecipe = await recipe.delete();
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
    if (req.userId !== recipe._doc._id) {
      throw new Error("Contributors may only modify their own recipes");
    }
  }

  const { category, tags, dietaries, ...fieldsToUpdate } = recipeInput;

  // update document fields
  Object.keys(fieldsToUpdate).forEach((fieldName) => {
    recipe[fieldName] = recipeInput[fieldName];
  });
  console.log("updated recipe fields");

  // rebuild the document links
  await removeRecipeLinks(recipe);
  console.log("removed recipe links");

  const updatedRecipe = await addRecipeLinks(recipe, category, tags, dietaries);
  console.log("added recipe links");

  return enrichRecipe(updatedRecipe);
};

// helper functions

const addRecipeLinks = async (recipe, categoryId, tagNames, dietaryIds) => {
  console.log(categoryId);
  console.log(tagNames);
  console.log(dietaryIds);
  // get the related documents
  const [category, tags, dietaries] = await Promise.all([
    Category.findById(categoryId),
    Promise.all(
      tagNames.map(async (tagName) => {
        let tag = await Tag.findOne({ name: tagName }).collation({
          locale: "en",
          strength: 1,
        });
        if (!tag) {
          const newTag = new Tag({ name: tagName, recipes: [] });
          tag = await newTag.save();
        }
        return tag;
      })
    ),
    Promise.all(
      (dietaryIds || recipe.dietaries).map((dietary) =>
        Dietary.findById(dietary)
      )
    ),
  ]);

  console.log(category._doc);

  // add the recipe ID into the related documents recipe arrays
  category.recipes.push(recipe);
  tags.map((tag) => tag.recipes.push(recipe));
  dietaries.map((dietary) => dietary.recipes.push(recipe));

  console.log(tags);

  await Promise.all([
    category.save(),
    ...tags.map((tag) => tag.save()),
    ...dietaries.map((dietary) => dietary.save()),
  ]);

  // add the references to the recipe
  recipe.category = categoryId;
  recipe.tags = tags;
  recipe.dietaries = dietaryIds;

  // return updated recipe
  return await recipe.save();
};

const removeRecipeLinks = async (recipe) => {
  const {
    _id: recipeId,
    category: categoryId,
    tags: tagIds,
    dietaries: dietaryIds,
  } = recipe;

  const [category, tags, dietaries] = await Promise.all([
    Category.findById(categoryId),
    Promise.all(tagIds.map((tag) => Tag.findById(tag))),
    Promise.all(dietaryIds.map((detiary) => Dietary.findById(detiary))),
  ]);

  // remove the recipeId from all the related documents
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
