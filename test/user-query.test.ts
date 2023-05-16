import axios from 'axios';
import { expect } from 'chai';
import { describe } from 'mocha';
import chaiExclude from 'chai-exclude';
import { getValidToken, insertUserInDB, makeRequest, userRepository } from 'test/helpers';
import { validUserInput } from 'test/inputs';
import { userQuery } from './graphql-snippets';

describe('user query', () => {
  afterEach(async () => {
    await userRepository.delete({});
  });

  it("should succeed if client is authenticated and query's id is valid", async () => {
    const token = getValidToken();
    const storedUser = await insertUserInDB(validUserInput);

    const res = (await makeRequest({ query: userQuery, variables: { userId: storedUser.id }, token })).data;

    expect(res.data.user).to.be.deep.equal({
      id: storedUser.id.toString(),
      name: storedUser.name,
      email: storedUser.email,
      birthDate: storedUser.birthDate,
    });
  });

  it('should fail if client queries an invalid id', async () => {
    const token = getValidToken();
    const storedUser = await insertUserInDB(validUserInput);

    const res = (await makeRequest({ query: userQuery, variables: { userId: storedUser.id + 99 }, token })).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Not found',
      code: 404,
      details: 'user does not exist',
    });
  });
});
