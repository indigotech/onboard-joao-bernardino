import { describe, it } from 'mocha';
import { expect } from 'chai';
import chaiExclude from 'chai-exclude';
import { getValidToken, makeRequest, userRepository } from 'test/helpers';
import { usersQuery } from 'test/graphql-snippets';
import { saveFakeUsers } from 'scripts/seed';

describe('users query', () => {
  afterEach(async () => {
    await userRepository.delete({});
  });

  it('should return the specified number of users sorted by name', async () => {
    const token = getValidToken();
    const storedUsers = await saveFakeUsers(20);

    const res = (await makeRequest({ query: usersQuery, variables: { count: 15, offset: 0 }, token })).data;

    const storedUsersSimplified = storedUsers.map((u) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, password, ...rest } = u;
      return { id: id.toString(), ...rest };
    });
    expect(res.data.users.users).to.be.deep.equal(
      storedUsersSimplified.sort((a, b) => (a.name > b.name ? 1 : -1)).slice(0, 15),
    );
  });

  it('should set hasNextPage and hasPreviousPage correctly when in the last page', async () => {
    const token = getValidToken();
    await saveFakeUsers(15);

    const res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 10 }, token })).data;

    expect(res.data.users.hasNextPage).to.be.false;
    expect(res.data.users.hasPreviousPage).to.be.true;
  });

  it('should set hasNextPage and hasPreviousPage correctly when in the first page', async () => {
    const token = getValidToken();
    await saveFakeUsers(15);

    const res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 0 }, token })).data;

    expect(res.data.users.hasNextPage).to.be.true;
    expect(res.data.users.hasPreviousPage).to.be.false;
  });

  it('should return the correct total number of users in the database', async () => {
    const token = getValidToken();
    await saveFakeUsers(20);

    const res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 0 }, token })).data;

    expect(res.data.users.totalNumberOfUsers).to.be.equal(20);
  });

  it('should return an empty list if offset >= total number of users', async () => {
    const token = getValidToken();
    await saveFakeUsers(20);

    const res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 20 }, token })).data;

    expect(res.data.users.users).to.be.empty;
    expect(res.data.users.hasNextPage).to.be.false;
    expect(res.data.users.hasPreviousPage).to.be.true;
  });
});
