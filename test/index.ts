import { describe, it, beforeEach } from 'mocha';
import { run } from '../src/server';
import { setupEnv } from '../src/environment';
import { use as chaiUse, expect } from 'chai';
import chaiExclude from 'chai-exclude';
import axios from 'axios';
import { appDataSource } from '../src/data-source';
import { User } from '../src/entity/user';
import { compare } from 'bcrypt';
import { UserInput } from './schema';

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

    function makeInput(fields?: object) {
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

    it('should respond with an error in case of invalid passwords', async () => {
      let userInput = makeInput({ password: 'short' });
      let responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should have at least 6 characters',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);

      userInput = makeInput({ password: 'abcdefghijklmnop' });
      responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a digit',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);

      userInput = makeInput({ password: '123456789' });
      responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a letter',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should respond with an error in case of invalid emails', async () => {
      // email with bad format
      let userInput = makeInput({ email: 'bademail.com' });
      let responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid email',
        code: 400,
        details: 'email has invalid format',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);

      // email already in use
      const existingUser = new User();
      Object.assign(existingUser, defaultUserInput);
      userRepository.save(existingUser);

      userInput = makeInput({ email: existingUser.email });
      responseData = (await requestUserCreation(userInput)).data.errors[0];

      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid email',
        code: 400,
        details: 'an user with that email already exists',
      });
      expect(await getNumberOfUsersInDB()).to.equal(1);
    });
  });
});
