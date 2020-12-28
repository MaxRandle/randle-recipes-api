import Tag from "../../models/tag";

export const tags = async (args, req) => {
  const tags = await Tag.find();
  return tags.map((tag) => tag);
};
