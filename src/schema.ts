const typeDefs = `#graphql
    type Query {
        hello: String
    }
`

const resolvers = {
    Query: {
        hello: () => "wassup?",
    },
}

export { typeDefs, resolvers }