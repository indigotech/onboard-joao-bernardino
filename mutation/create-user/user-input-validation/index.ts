import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import chaiExclude from 'chai-exclude';
import { Not } from 'typeorm';
import { User } from 'src/entity/user';
import { generateToken } from 'src/token';
import { hashString } from 'src/hash-string';
import { makeUserInput, requestUserCreation } from 'test/mutation/create-user/helpers';
import { defaultUserInput, testerUserInput, userRepository } from 'test/helpers';

describe('user input validation', () => {
  let serverUrl: string;
  let token: string;
  let testerUserId: number;

  before(async () => {
    serverUrl = `http://localhost:${process.env.PORT}/`;

    await userRepository.delete({});
    const tester = new User();
    Object.assign(tester, testerUserInput);
    tester.password = await hashString(tester.password);
    await userRepository.save(tester);
    testerUserId = tester.id;
    token = generateToken(tester.id, true);
  });

  beforeEach(async () => {
    await userRepository.delete({ id: Not(testerUserId) });
  });

  it('should give an error in case of short passwords', async () => {
    const userInput = makeUserInput({ password: 'short' });
    const responseData = (await requestUserCreation(userInput, serverUrl, token)).data.errors[0];
    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should have at least 6 characters',
    });
    expect(await userRepository.countBy({ id: Not(testerUserId) })).to.equal(0);
  });

  it('should give an error in case of passwords with no digits', async () => {
    const userInput = makeUserInput({ password: 'abcdefghijklmnop' });
    const responseData = (await requestUserCreation(userInput, serverUrl, token)).data.errors[0];
    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should contain a digit',
    });
    expect(await userRepository.countBy({ id: Not(testerUserId) })).to.equal(0);
  });

  it('should give an error in case of passwords with no letters', async () => {
    const userInput = makeUserInput({ password: '123456789' });
    const responseData = (await requestUserCreation(userInput, serverUrl, token)).data.errors[0];
    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should contain a letter',
    });
    expect(await userRepository.countBy({ id: Not(testerUserId) })).to.equal(0);
  });

  it('should give an error in case of emails with incorrect formats', async () => {
    const userInput = makeUserInput({ email: 'bademail.com' });
    const responseData = (await requestUserCreation(userInput, serverUrl, token)).data.errors[0];
    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid email',
      code: 400,
      details: 'email has invalid format',
    });
    expect(await userRepository.countBy({ id: Not(testerUserId) })).to.equal(0);
  });

  it('should give an error in case of duplicated emails', async () => {
    const existingUser = new User();
    Object.assign(existingUser, defaultUserInput);
    await userRepository.save(existingUser);

    const userInput = makeUserInput({ email: existingUser.email });
    const responseData = (await requestUserCreation(userInput, serverUrl, token)).data.errors[0];

    expect(responseData).excluding('stacktrace').to.deep.equal({
      message: 'invalid email',
      code: 400,
      details: 'an user with that email already exists',
    });
    expect(await userRepository.countBy({ id: Not(testerUserId) })).to.equal(1);
  });
});
