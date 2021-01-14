import Tag from "../../models/tagModel.js";
import { enrichTag } from "./merge.js";

export const tags = async (args, req) => {
  const tags = await Tag.find();
  return tags.map((tag) => enrichTag(tag));
};

export const createTag = async ({ name }, req) => {
  if (!req.isAuth) {
    throw new Error("Unauthenticated request to a restricted resource.");
  } else if (!req.userRole !== "Administrator") {
    throw new Error("You are not authorized to perform that action.");
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
  return await Tag.findOne({
    name: args.name,
  }).collation({
    locale: "en",
    strength: 1,
  });
};
