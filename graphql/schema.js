import buildSchema from "graphql";

const schema = buildSchema(`
    type Tag {
        _id: ID!
        name: String!
        recipes: [Recipe]!
    }

    type Category {
        _id: ID!
        name: String!
        recipes: [Recipe]!
    }

    type Recipe {
        title: String!
        subtitle: String!
        intro: String!
        tags: [Tag]!
        categories: [Category!]!
    }

    input RecipeInput {
        title: String!
        subtitle: String!
        intro: String!
    }

    type RootQuery {
        recipes: [Recipe!]!
    }

    type RootMutation {
        createRecipe(recipe: RecipeInput)      
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

export default schema;
