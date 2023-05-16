import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as jwt from 'jsonwebtoken';
import chaiExclude from 'chai-exclude';
import { makeRequest, userRepository } from 'test/helpers';
import { createUserMutation } from 'test/graphql-snippets';
import { validUserInput } from 'test/inputs';

describe('authentication', () => {
  afterEach(async () => {
    await userRepository.delete({});
  });

  it('should fail if token is not sent', async () => {
    const res = (await makeRequest({ query: createUserMutation, variables: { data: validUserInput } })).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Authentication failed',
      code: 401,
      details: 'no token provided',
    });
  });

  it('should fail if token has invalid signature', async () => {
    const token = jwt.sign({ id: 1 }, 'wrongkey', { expiresIn: '99h' });
    const res = (await makeRequest({ query: createUserMutation, variables: { data: validUserInput }, token })).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Authentication failed',
      code: 401,
      details: 'invalid signature',
    });
  });

  it('should fail if token expired', async () => {
    const token = jwt.sign({ id: 1, exp: Date.now() / 1000 - 3600 }, process.env.JWT_PRIVATE_KEY!);
    const res = (await makeRequest({ query: createUserMutation, variables: { data: validUserInput }, token })).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Authentication failed',
      code: 401,
      details: 'jwt expired',
    });
  });
});
