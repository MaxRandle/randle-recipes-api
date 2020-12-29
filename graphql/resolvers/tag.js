import Tag from "../../models/tagModel.js";
import { enrichTag } from "./merge.js";

export const tags = async (args, req) => {
  const tags = await Tag.find();
  return tags.map((tag) => enrichTag(tag));
};

export const createTag = async ({ name }, req) => {
  const newTag = new Tag({
    name,
    recipes: [],
  });
  const createdTag = await newTag.save();
  return enrichTag(createdTag);
};
