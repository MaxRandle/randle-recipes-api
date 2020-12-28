import express, { json } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
dotenv.config();

// constants
const __prod__ = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 5000;
const DATABASE_URI = process.env.MONGODB_URI;

const app = express();

// middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: __prod__ ? undefined : false }));
app.use(morgan("tiny"));
app.use(cors());
app.use(json());

import graphQlSchema from "./graphql/schema";

// endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

// database connect > server start
mongoose
  .connect(DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB successfully connected");
    app.listen(PORT, () => console.log("server listening over port", PORT));
  })
  .catch((err) => console.log(err));
