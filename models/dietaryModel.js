import pkg from "mongoose";
const { Schema, model } = pkg;

const dietarySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  recipes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
});

export default model("Dietary", dietarySchema);
