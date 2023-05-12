export const typeDefs = `#graphql
  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String!
  }

  type LoginInfo {
    user: User!
    token: String!
  }

  type Query {
    hello: String
  }

  type Mutation {
    createUser(data: UserInput): User
    login(credentials: LoginInput): LoginInfo
  }
`;
