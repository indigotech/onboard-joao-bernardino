import { describe, it, beforeEach } from 'mocha';
import { run } from '../src/server';
import { setupEnv } from '../src/environment';
import { use as chaiUse, expect } from 'chai';
import chaiExclude from 'chai-exclude';
import axios from 'axios';
import { appDataSource } from '../src/data-source';
import { User } from '../src/entity/user';
import { compare } from 'bcrypt';

let serverUrl: string;

chaiUse(chaiExclude);

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

      const responseData = res.data.data.createUser;
      const storedUserData = await userRepository.findOne({ where: {} });

      expect(responseData).excluding(['id', 'password']).to.deep.equal(userInput);
      expect(storedUserData).excluding(['id', 'password']).to.deep.equal(userInput);
      expect(await compare(userInput.password, storedUserData!.password)).to.be.true;
    });
  });
});
