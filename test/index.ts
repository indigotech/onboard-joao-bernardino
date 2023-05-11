import { describe, it, beforeEach } from 'mocha';
import { run } from '../src/server';
import { setupEnv } from '../src/environment';
import { use as chaiUse, expect } from 'chai';
import chaiExclude from 'chai-exclude';
import axios from 'axios';
import { appDataSource } from '../src/data-source';
import { User } from '../src/entity/user';
import { compare } from 'bcrypt';
import { LoginInput, UserInput } from '../src/inputs';
import { hashString } from '../src/hash-string';
import * as jwt from 'jsonwebtoken';
import { stringify } from 'querystring';

let serverUrl: string;

chaiUse(chaiExclude);

before(async () => {
  setupEnv();
  await run();
  serverUrl = `http://localhost:${process.env.PORT}/`;
});

describe('Mutation', () => {
  const userRepository = appDataSource.getRepository(User);

  const defaultUserInput = {
    birthDate: '2003-19-01',
    email: 'john.smith@email.com',
    name: 'John Smith',
    password: 'password123',
  };

  const defaultLoginInput = {
    email: defaultUserInput.email,
    password: defaultUserInput.password,
  };

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

  function makeUserInput(fields?: Partial<UserInput>) {
    return { ...defaultUserInput, ...fields };
  }

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

  async function insertUserInDB(fields?: Partial<UserInput>) {
    const newUser = new User();
    Object.assign(newUser, { ...defaultUserInput, ...fields });
    newUser.password = await hashString(newUser.password);
    await userRepository.save(newUser);
    return newUser;
  }

  describe('createUser', () => {
    beforeEach(async () => {
      await userRepository.delete({});
    });

    it('should create user in db and return it in response', async () => {
      const userInput = makeUserInput();
      const responseData = (await requestUserCreation(userInput)).data.data.createUser;
      const storedUserData = await userRepository.findOne({ where: {} });

      expect(responseData).excluding(['id', 'password']).to.deep.equal(userInput);
      expect(storedUserData).excluding(['id', 'password']).to.deep.equal(userInput);

      expect(+responseData.id).to.equal(storedUserData!.id); // responseData.id is a string
      expect(await compare(userInput.password, storedUserData!.password)).to.be.true;
    });

    it('should give an error in case of short passwords', async () => {
      const userInput = makeUserInput({ password: 'short' });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should have at least 6 characters',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should give an error in case of passwords with no digits', async () => {
      const userInput = makeUserInput({ password: 'abcdefghijklmnop' });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a digit',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should give an error in case of passwords with no letters', async () => {
      const userInput = makeUserInput({ password: '123456789' });
      const responseData = (await requestUserCreation(userInput)).data.errors[0];
      expect(responseData).excluding('stacktrace').to.deep.equal({
        message: 'invalid password',
        code: 400,
        details: 'password should contain a letter',
      });
      expect(await getNumberOfUsersInDB()).to.equal(0);
    });

    it('should give an error in case of emails with incorrect formats', async () => {
      const userInput = makeUserInput({ email: 'bademail.com' });
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
      await userRepository.save(existingUser);

      const userInput = makeUserInput({ email: existingUser.email });
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
    beforeEach(async () => {
      await userRepository.delete({});
    });

    it('should succeed if credentials are correct', async () => {
      const newUser = await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin(defaultLoginInput)).data;
      const loginInfo = response.data.login;

      expect(loginInfo.user).to.deep.equal({
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      });
      expect(loginInfo).to.haveOwnProperty('token');

      const jwtPayload = jwt.verify(loginInfo.token, process.env.JWT_PRIVATE_KEY!) as jwt.JwtPayload;
      expect(jwtPayload).keys(['id', 'exp', 'iat']);
      expect(jwtPayload.id).to.equal(newUser.id);
      expect((jwtPayload.exp! - jwtPayload.iat!) / 3600).to.equal(+process.env.JWT_EXPIRATION_HOURS!);
    });

    it('should extend token lifetime if remeberMe is true', async () => {
      const newUser = await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin({ ...defaultLoginInput, rememberMe: true })).data;
      const loginInfo = response.data.login;

      expect(loginInfo.user).excluding(['password', 'id']).to.deep.equal(newUser);
      expect(+loginInfo.user.id).to.deep.equal(newUser.id);
      expect(loginInfo).to.haveOwnProperty('token');

      const jwtPayload = jwt.verify(loginInfo.token, process.env.JWT_PRIVATE_KEY!) as jwt.JwtPayload;
      expect(jwtPayload).keys(['id', 'exp', 'iat']);
      expect(jwtPayload.id).to.equal(newUser.id);
      expect((jwtPayload.exp! - jwtPayload.iat!) / 3600).to.equal(+process.env.JWT_EXTENDED_EXPIRATION_HOURS!);
    });

    it('should fail if no user has the given email', async () => {
      await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin({ ...defaultLoginInput, email: 'wrong@email.com' })).data;

      expect(response.errors[0]).excluding('stacktrace').to.deep.equal({
        message: 'Invalid credentials',
        code: 401,
        details: 'Wrong email or password',
      });
    });

    it('should fail if password is wrong', async () => {
      await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin({ ...defaultLoginInput, password: 'wr0ngpassword' })).data;

      expect(response.errors[0]).excluding('stacktrace').to.deep.equal({
        message: 'Invalid credentials',
        code: 401,
        details: 'Wrong email or password',
      });
    });
  });
});
