import { describe, it } from 'mocha';
import { expect } from 'chai';
import chaiExclude from 'chai-exclude';
import { getValidToken, insertUserInDB, makeRequest, userRepository } from 'test/helpers';
import { usersQuery } from 'test/graphql-snippets';
import { saveFakeUsers } from 'scripts/seed';

describe('users query', () => {

  afterEach(async () => {
    await userRepository.delete({});
  });

  it('should only send the specified number of users', async () => {
    let token = getValidToken();
    await saveFakeUsers(20);

    let res = (await makeRequest({ query: usersQuery, variables: { count: 15, offset: 0}, token })).data;

    expect(res.data.users.users.length).to.be.equal(15);
  });

  it('should set hasNextPage and hasPreviousPage correctly when in the last page', async () => {
    let token = getValidToken();
    await saveFakeUsers(15);

    let res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 10}, token })).data;

    expect(res.data.users.hasNextPage).to.be.false;
    expect(res.data.users.hasPreviousPage).to.be.true;
  });

  it('should set hasNextPage and hasPreviousPage correctly when in the first page', async () => {
    let token = getValidToken();
    await saveFakeUsers(15);

    let res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 0}, token })).data;

    expect(res.data.users.hasNextPage).to.be.true;
    expect(res.data.users.hasPreviousPage).to.be.false;
  });

  it('should return the correct total number of users in the database', async () => {
    let token = getValidToken();
    await saveFakeUsers(20);

    let res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 0}, token })).data;

    expect(res.data.users.totalNumberOfUsers).to.be.equal(20);
  });

  it('should return the users sorted by name', async () => {
    let token = getValidToken();
    await saveFakeUsers(20);

    let res = (await makeRequest({ query: usersQuery, variables: { count: 10, offset: 0}, token })).data;

    const names = res.data.users.users.map((u: {id:string; name:string; birthDate:string; email:string}) => u.name);
    expect(names).to.be.deep.equal([...names].sort());
  });
});
