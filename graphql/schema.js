import { buildSchema } from "graphql";

const schema = buildSchema(`

    type GenericTag {
        _id: ID!
        name: String!
        recipes: [Recipe]!
    }

    type Recipe {
        _id: ID!
        title: String!
        subtitle: String!
        intro: String!
        tags: [GenericTag]!
        categories: [GenericTag!]!
    }

    type User {
        _id: ID!
        email: String!
        password: String
        name: String!
        recipes: [Recipe!]!
        role: String!
        avatar: String
    }

    input UserInput {
        email: String!
        password: String!
        name: String!
    }

    input RecipeInput {
        title: String!
        subtitle: String!
        intro: String!
    }

    type AuthData {
        userId: ID!
        email: String!
        name: String!
        token: String!
        tokenExpiration: Int
    }

    type RootQuery {
        categories: [GenericTag!]!
        tags: [GenericTag!]!
        dietaries: [GenericTag!]!
        recipes: [Recipe!]!
        login(email: String! password: String!): AuthData!
        verifyJwt: AuthData!
    }

    type RootMutation {
        createTag(name: String!): GenericTag!
        createDietary(name: String!): GenericTag!
        createRecipe(recipe: RecipeInput): Recipe!  
        createUser(userInput: UserInput): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

export default schema;
