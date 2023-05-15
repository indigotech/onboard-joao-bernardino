import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import chaiExclude from 'chai-exclude';
import { makeUserInput, requestUserCreation, getNumberOfUsersInDB } from './helpers';
import { User } from '../../src/entity/user';
import { compare } from 'bcrypt';
import { defaultUserInput, userRepository } from '../helpers';

describe('createUser', () => {
  let serverUrl: string;

  before(() => {
    serverUrl = `http://localhost:${process.env.PORT}/`;
  });

  beforeEach(async () => {
    await userRepository.delete({});
  });

  it('should create user in db and return it in response', async () => {
    const userInput = makeUserInput();
    const responseData = (await requestUserCreation(userInput, serverUrl)).data.data.createUser;
    const storedUserData = await userRepository.findOne({ where: {} });

    expect(responseData).excluding(['id', 'password']).to.deep.equal(userInput);
    expect(storedUserData).excluding(['id', 'password']).to.deep.equal(userInput);

    expect(+responseData.id).to.equal(storedUserData!.id);
    expect(await compare(userInput.password, storedUserData!.password)).to.be.true;
  });

  it('should give an error in case of short passwords', async () => {
    const userInput = makeUserInput({ password: 'short' });
    const responseData = (await requestUserCreation(userInput, serverUrl)).data.errors[0];
    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should have at least 6 characters',
    });
    expect(await getNumberOfUsersInDB()).to.equal(0);
  });

  it('should give an error in case of passwords with no digits', async () => {
    const userInput = makeUserInput({ password: 'abcdefghijklmnop' });
    const responseData = (await requestUserCreation(userInput, serverUrl)).data.errors[0];
    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should contain a digit',
    });
    expect(await getNumberOfUsersInDB()).to.equal(0);
  });

  it('should give an error in case of passwords with no letters', async () => {
    const userInput = makeUserInput({ password: '123456789' });
    const responseData = (await requestUserCreation(userInput, serverUrl)).data.errors[0];
    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should contain a letter',
    });
    expect(await getNumberOfUsersInDB()).to.equal(0);
  });

  it('should give an error in case of emails with incorrect formats', async () => {
    const userInput = makeUserInput({ email: 'bademail.com' });
    const responseData = (await requestUserCreation(userInput, serverUrl)).data.errors[0];
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
    const responseData = (await requestUserCreation(userInput, serverUrl)).data.errors[0];

    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid email',
      code: 400,
      details: 'an user with that email already exists',
    });
    expect(await getNumberOfUsersInDB()).to.equal(1);
  });
});
