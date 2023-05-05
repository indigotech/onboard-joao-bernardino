export const typeDefs = `#graphql
  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String!
  }

  type Query {
    hello: String
  }

  type Mutation {
    createUser(data: UserInput): User
  }
`;

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}
