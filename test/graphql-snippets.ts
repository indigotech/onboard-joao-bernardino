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
      addresses {
        cep
        city
        complement
        id
        neighborhood
        state
        street
        streetNumber
      }
    }
  }
`;

export const usersQuery = `#graphql
  query Users($count: Int, $offset: Int) {
    users(count: $count, offset: $offset) {
      hasNextPage
      hasPreviousPage
      totalNumberOfUsers
      users {
        name
        id
        email
        birthDate
      }
    }
  }
`;
