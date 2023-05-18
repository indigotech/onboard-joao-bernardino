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
    rememberMe: Boolean
  }

  type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String!
  }

  type UserPageInfo {
    users: [User!]!
    totalNumberOfUsers: Int!
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  type LoginInfo {
    user: User!
    token: String!
  }

  type Query {
    user(id: ID!): User
    users(count: Int, offset: Int): UserPageInfo
  }

  type Mutation {
    createUser(data: UserInput): User
    login(credentials: LoginInput): LoginInfo
  }
`;
