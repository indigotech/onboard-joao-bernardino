import axios from 'axios';
import { UserInput } from '../../src/inputs';
import { defaultUserInput, userRepository } from '../helpers';

export async function requestUserCreation(input: UserInput, serverUrl: string) {
  const mutation = `#graphql
    mutation CreateUser($data: UserInput) {
        createUser(data: $data) { 
        id 
        name 
        birthDate 
        email 
    }}
  `;

  return axios.post(serverUrl, {
    query: mutation,
    variables: {
      data: input,
    },
    operationName: 'CreateUser',
  });
}

export async function getNumberOfUsersInDB() {
  return userRepository.count({});
}

export function makeUserInput(fields?: Partial<UserInput>) {
  return { ...defaultUserInput, ...fields };
}
