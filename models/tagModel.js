import pkg from "mongoose";
const { Schema, model } = pkg;

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
    index: {
      unique: true,
      collation: { locale: "en", strength: 1 },
    },
  },
});

export default model("Tag", tagSchema);
