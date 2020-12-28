import { Schema, model } from "mongoose";

const tagSchema = new Schema({
  recipes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
  name: {
    type: String,
    required: true,
  },
});

export default model("Tag", tagSchema);
