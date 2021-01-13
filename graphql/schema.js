import { buildSchema } from "graphql";

const schema = buildSchema(`

    type GenericTag {
        _id: ID!
        name: String!
        recipes: [Recipe]!
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

    type Section {
        title: String
        intro: String
        ingredients: [String!]!
        method: String!
    }

    input SectionInput {
        title: String
        intro: String
        ingredients: [String!]!
        method: String!
    }

    type Recipe {
        _id: ID!
        author: User!
        title: String!
        subtitle: String!
        intro: String!
        category: GenericTag!
        tags: [GenericTag]!
        dietaries: [GenericTag]!
        photos: [String]
        sections: [Section!]!
        size: String
        prepTime: String
        cookTime: String
        tips: [String]
        difficulty: Int
        equipment: [String]!
    }

    input RecipeInput {
        title: String!
        subtitle: String!
        intro: String!
        category: [String!]!
        tags: [String]!
        dietaries: [String]!
        photos: [String]!
        sections: [SectionInput!]!
        size: String
        prepTime: String
        cookTime: String
        tips: [String]
        difficulty: Int
        equipment: [String]!
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
        getTagByName(name: String!): GenericTag
    }

    type RootMutation {
        createTag(name: String!): GenericTag!
        createDietary(name: String!): GenericTag!
        createUser(userInput: UserInput): User!
        createRecipe(recipeInput: RecipeInput!): Recipe!
        deleteRecipe(recipeId: String!): Recipe!
        updateRecipe(recipeId: String! recipeInput: RecipeInput!): Recipe!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);

export default schema;
