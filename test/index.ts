import { describe, it, beforeEach } from 'mocha';
import { run } from '../src/server';
import { setupEnv } from '../src/environment';
import { use as chaiUse, expect } from 'chai';
import chaiExclude from 'chai-exclude';
import axios from 'axios';
import { appDataSource } from '../src/data-source';
import { User } from '../src/entity/user';
import { compare } from 'bcrypt';
import { LoginInput, UserInput } from './schema';

let serverUrl: string;

chaiUse(chaiExclude);

before(async () => {
  setupEnv();
  await run();
  serverUrl = `http://localhost:${process.env.PORT}/`;
});

describe('Mutation', () => {
  const userRepository = appDataSource.getRepository(User);

  describe('createUser', () => {
    const defaultUserInput = {
      birthDate: '2003-19-01',
      email: 'john.smith@email.com',
      name: 'John Smith',
      password: 'password123',
    };

    beforeEach(async () => {
      await userRepository.delete({});
    });

    async function requestUserCreation(input: UserInput) {
      const mutation = `#graphql
        mutation CreateUser($data: UserInput) {
           createUser(data: $data) { 
            id 
            name 
            birthDate 
            email 
        }}
      `;

      return await axios.post(serverUrl, {
        query: mutation,
        variables: {
          data: input,
        },
        operationName: 'CreateUser',
      });
    }

    async function getNumberOfUsersInDB() {
      return await userRepository.count({});
    }

    function makeInput(fields?: Partial<UserInput>) {
      return { ...defaultUserInput, ...fields };
    }

    it('should create user in db and return it in response', async () => {
      const userInput = makeInput();
      const responseData = (await requestUserCreation(userInput)).data.data.createUser;
      const storedUserData = await userRepository.findOne({ where: {} });

      expect(responseData).excluding(['id', 'password']).to.deep.equal(userInput);
      expect(storedUserData).excluding(['id', 'password']).to.deep.equal(userInput);

      expect(+responseData.id).to.equal(storedUserData!.id); // responseData.id is a string
      expect(await compare(userInput.password, storedUserData!.password)).to.be.true;
    });

    it('should give an error in case of short passwords', async () => {
      const userInput = makeInput({ password: 'short' });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should have at least 6 characters',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should give an error in case of passwords with no digits', async () => {
      const userInput = makeInput({ password: 'abcdefghijklmnop' });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a digit',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should give an error in case of passwords with no letters', async () => {
      const userInput = makeInput({ password: '123456789' });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a letter',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should give an error in case of emails with incorrect formats', async () => {
      const userInput = makeInput({ email: 'bademail.com' });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid email',
        code: 400,
        details: 'email has invalid format',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should give an error in case of duplicated emails', async () => {
      const existingUser = new User();
      Object.assign(existingUser, defaultUserInput);
      userRepository.save(existingUser);

      const userInput = makeInput({ email: existingUser.email });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];

      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid email',
        code: 400,
        details: 'an user with that email already exists',
      });
      expect(await getNumberOfUsersInDB()).to.equal(1);
    });
  });

  describe('login', () => {
    const defaultLoginInput = {
      email: 'john.smith@email.com',
      password: 'abcd1234',
    };

    async function requestLogin(input: LoginInput) {
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

      return await axios.post(serverUrl, {
        query: mutation,
        variables: {
          credentials: input,
        },
        operationName: 'Login',
      });
    }

    it('should respond correctly to a login request', async () => {
      const res = (await requestLogin(defaultLoginInput)).data;
      expect(res).to.deep.equal({
        data: {
          login: {
            user: {
              id: '12',
              name: 'User Name',
              email: 'User e-mail',
              birthDate: '04-25-1990',
            },
            token: 'the_token',
          },
        },
      });
    });
  });
});
