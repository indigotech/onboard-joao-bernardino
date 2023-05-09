import { describe, it, beforeEach } from 'mocha';
import { run } from '../src/server';
import { expect } from 'chai';
import { setupEnv } from '../src/environment';
import axios from 'axios';
import { appDataSource } from '../src/data-source';
import { User } from '../src/entity/user';
import { compare } from 'bcrypt';

var serverUrl: string;

before(async () => {
  setupEnv();
  await run();
  serverUrl = `http://localhost:${process.env.PORT}/`;
});

describe('Query', () => {
  describe('hello', () => {
    it('should respond to a hello query', async () => {
      const res = await axios.post(serverUrl, {
        query: 'query Query { hello }',
        variables: {},
        operationName: 'Query',
      });

      expect(res.data).to.deep.equal({ data: { hello: 'wassup?' } });
    });
  });
});

describe('Mutation', () => {
  const userRepository = appDataSource.getRepository(User);

  describe('createUser', () => {
    beforeEach(() => {
      userRepository.delete({});
    });

    it('should create user in db and return it in response', async () => {
      const userInput = {
        birthDate: '2003-19-01',
        email: 'joao.bernardino@taqtile.com',
        name: 'João Bernardino',
        password: 'senha123',
      };

      const res = await axios.post(serverUrl, {
        query: 'mutation CreateUser($data: UserInput) { createUser(data: $data) { id name birthDate email }}',
        variables: {
          data: userInput,
        },
        operationName: 'CreateUser',
      });

      const numberOfNewRows = await userRepository.count({ where: {} });
      const storedUserData = await userRepository.findOne({ where: {} });

      // console.log's are placeholders, will replace with expect's
      console.log(res.data);
      console.log(numberOfNewRows);
      console.log(storedUserData);
      if (storedUserData) {
        console.log(await compare(userInput.password, storedUserData.password));
      }
    });
  });
});
