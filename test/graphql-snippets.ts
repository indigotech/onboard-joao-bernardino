export const createUserMutation = `#graphql
  mutation CreateUser($data: UserInput) {
      createUser(data: $data) { 
      id 
      name 
      birthDate 
      email 
  }}
`;

export const loginMutation = `#graphql 
  mutation Login($credentials: LoginInput) {
    login(credentials: $credentials) {
      user {
        id
        name
        birthDate
        email
      }
      token
    }
  }
`;

export const userQuery = `#graphql
  query Query($userId: ID!) {
    user(id: $userId) {
      birthDate
      email
      id
      name
    }
  }
`;
