import axios from 'axios';
import { UserInput } from '../../src/inputs';
import { defaultUserInput } from '../helpers';

export async function requestUserCreation(input: UserInput, serverUrl: string, token: string) {
  const mutation = `#graphql
    mutation CreateUser($data: UserInput) {
        createUser(data: $data) { 
        id 
        name 
        birthDate 
        email 
    }}
  `;

  return axios.post(
    serverUrl,
    {
      query: mutation,
      variables: {
        data: input,
      },
      operationName: 'CreateUser',
    },
    {
      headers: {
        Authorization: token,
      },
    },
  );
}

export function makeUserInput(fields?: Partial<UserInput>) {
  return { ...defaultUserInput, ...fields };
}
