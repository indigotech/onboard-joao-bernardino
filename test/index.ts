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
    let userInput: UserInput;
    const defaultUserInput = {
      birthDate: '2003-19-01',
      email: 'john.smith@email.com',
      name: 'John Smith',
      password: 'password123',
    };

    beforeEach(async () => {
      userInput = defaultUserInput;
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

    it('should create user in db and return it in response', async () => {
      const responseData = (await requestUserCreation(userInput)).data.data.createUser;
      const storedUserData = await userRepository.findOne({ where: {} });

      expect(responseData).excluding(['id', 'password']).to.deep.equal(userInput);
      expect(storedUserData).excluding(['id', 'password']).to.deep.equal(userInput);

      expect(+responseData.id).to.equal(storedUserData!.id); // responseData.id is a string
      expect(await compare(userInput.password, storedUserData!.password)).to.be.true;
    });

    it('should respond with an error in case of invalid passwords', async () => {
      userInput.password = 'short';
      let responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should have at least 6 characters',
      });

      userInput.password = 'abcdefghijklmnop';
      responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a digit',
      });

      userInput.password = '123456789';
      responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a letter',
      });
    });
  });
});
