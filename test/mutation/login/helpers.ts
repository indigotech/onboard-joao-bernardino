import axios from 'axios';
import { User } from 'src/entity/user';
import { LoginInput, UserInput } from 'src/inputs';
import { hashString } from 'src/hash-string';
import { defaultUserInput, userRepository } from 'test/helpers';

export const defaultLoginInput = {
  email: defaultUserInput.email,
  password: defaultUserInput.password,
};

export async function requestLogin(input: LoginInput, serverUrl: string) {
  const mutation = `#graphql 
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

  return axios.post(serverUrl, {
    query: mutation,
    variables: {
      credentials: input,
    },
    operationName: 'Login',
  });
}

export async function insertUserInDB(fields?: Partial<UserInput>) {
  const newUser = new User();
  Object.assign(newUser, { ...defaultUserInput, ...fields });
  newUser.password = await hashString(newUser.password);
  await userRepository.save(newUser);
  return newUser;
}
