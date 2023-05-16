import { describe, it } from 'mocha';
import { expect } from 'chai';
import { requestUserCreation } from '../helpers';
import { User } from '../../../src/entity/user';
import { defaultUserInput, testerUserInput, userRepository } from '../../helpers';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { hashString } from '../../../src/hash-string';
import chaiExclude from 'chai-exclude';
import { Not } from 'typeorm';

describe('authentication', () => {
  let serverUrl: string;
  let testerUserId: number;

  before(async () => {
    serverUrl = `http://localhost:${process.env.PORT}/`;

    await userRepository.delete({});
    const tester = new User();
    Object.assign(tester, testerUserInput);
    tester.password = await hashString(tester.password);
    await userRepository.save(tester);
    testerUserId = tester.id;
  });

  beforeEach(async () => {
    await userRepository.delete({ id: Not(testerUserId) });
  });

  const mutation = `#graphql
    mutation CreateUser($data: UserInput) {
        createUser(data: $data) { 
        id 
        name 
        birthDate 
        email 
    }}
  `;

  it('should fail if token is not sent', async () => {
    const res = (
      await axios.post(serverUrl, {
        query: mutation,
        variables: {
          data: defaultUserInput,
        },
        operationName: 'CreateUser',
      })
    ).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Authentication failed',
      code: 401,
      details: 'no token provided',
    });
  });

  it('should fail if token has invalid signature', async () => {
    const token = jwt.sign({ id: testerUserId }, 'wrongkey', { expiresIn: '99h' });
    const res = (await requestUserCreation(defaultUserInput, serverUrl, token)).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Authentication failed',
      code: 401,
      details: 'invalid signature',
    });
  });

  it('should fail if token expired', async () => {
    const token = jwt.sign({ id: testerUserId, exp: Date.now() / 1000 - 3600 }, process.env.JWT_PRIVATE_KEY!);
    const res = (await requestUserCreation(defaultUserInput, serverUrl, token)).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Authentication failed',
      code: 401,
      details: 'jwt expired',
    });
  });

  it('should fail if user is not in the database', async () => {
    const token = jwt.sign({ id: testerUserId + 1 }, process.env.JWT_PRIVATE_KEY!, { expiresIn: '99h' });
    const res = (await requestUserCreation(defaultUserInput, serverUrl, token)).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Authentication failed',
      code: 401,
      details: 'invalid user',
    });
  });
});
