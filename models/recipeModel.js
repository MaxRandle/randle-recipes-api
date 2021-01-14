import pkg from "mongoose";
const { Schema, model } = pkg;

const sectionSchema = new Schema({
  title: String,
  intro: String,
  ingredients: [
    {
      type: String,
      required: true,
    },
  ],
  method: {
    type: String,
    required: true,
  },
});

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    intro: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    dietaries: [
      {
        type: Schema.Types.ObjectId,
        ref: "Dietary",
      },
    ],
    photos: [String],
    sections: [sectionSchema],
    size: String,
    prepTime: String,
    cookTime: String,
    tips: [String],
    difficulty: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    equipment: [String],
  },
  { timestamps: true }
);

export default model("Recipe", recipeSchema);
