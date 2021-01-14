import express, { json } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { graphqlHTTP } from "express-graphql";
import isAuth from "./middleware/isAuth.js";
import dotenv from "dotenv";
dotenv.config();

// constants
const __prod__ = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

// middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: __prod__ ? undefined : false }));
app.use(morgan("tiny"));
app.use(cors());
app.use(json());
app.use(isAuth());

// resolvers
import graphQlSchema from "./graphql/schema.js";
import * as categoryResolvers from "./graphql/resolvers/category.js";
import * as tagResolvers from "./graphql/resolvers/tag.js";
import * as dietaryResolvers from "./graphql/resolvers/dietary.js";
import * as recipeResolvers from "./graphql/resolvers/recipe.js";
import * as userResolvers from "./graphql/resolvers/user.js";

// graphql endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: {
      ...categoryResolvers,
      ...tagResolvers,
      ...dietaryResolvers,
      ...recipeResolvers,
      ...userResolvers,
    },
    graphiql: true,
  })
);

// database connect > server start
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB successfully connected");
    app.listen(PORT, () => console.log("server listening over port", PORT));
  })
  .catch((err) => console.log(err));
