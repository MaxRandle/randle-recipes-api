import Recipe from "../../models/recipeModel.js";
import Tag from "../../models/tagModel.js";
import { roles } from "../accessControl.js";
import { enrichTag } from "./merge.js";

export const tags = async (args, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }

  const tags = await Tag.find();
  return tags.map((tag) => enrichTag(tag));
};

export const createTag = async (args, req) => {
  const { name } = args;

  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (req.userRole !== roles.admin) {
    throw new Error("You are not authorized to perform that action.");
  }

  const tag = await Tag.findOne({
    name: name,
  }).collation({
    locale: "en",
    strength: 1,
  });

  if (tag) {
    throw new Error(`A tag with a similar name already exists: ${tag.name}`);
  }

  try {
    const newTag = new Tag({
      name,
      recipes: [],
    });
    const createdTag = await newTag.save();
    return enrichTag(createdTag);
  } catch (err) {
    if (err.message.startsWith("E11000")) {
      err.message = "Tag already exists.";
    }
    throw err;
  }
};

export const getTagByName = async (args, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  }

  const tag = await Tag.findOne({
    name: args.name,
  }).collation({
    locale: "en",
    strength: 1,
  });

  return enrichTag(tag);
};

export const renameTag = async (args, req) => {
  const { tagId, newName } = args;

  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (req.userRole !== roles.admin) {
    throw new Error("You are not authorized to perform that action.");
  }

  const tag = await Tag.findById(tagId);
  if (!tag) {
    throw Error("Tag not found.");
  }

  tag.name = newName;
  const updatedTag = await tag.save();
  return enrichTag(updatedTag);
};

export const deleteTag = async (args, req) => {
  const { tagId } = args;

  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (req.userRole !== roles.admin) {
    throw new Error("You are not authorized to perform that action.");
  }

  const tag = await Tag.findById(tagId);
  if (!tag) {
    throw Error("Tag not found.");
  }

  // find all the recipes that use that tag
  const recipes = await Promise.all(
    tag.recipes.map((recipeId) => Recipe.findById(recipeId))
  );

  console.log(recipes);

  // delete the tag from those recipes tag arrays
  recipes.map((recipe) => {
    recipe.tags = recipe.tags.filter((recipeTagId) => recipeTagId !== tagId);
  });

  //save the recipes
  await Promise.all(recipes.map((recipe) => recipe.save()));

  // delete the tag
  return await tag.delete();
};
