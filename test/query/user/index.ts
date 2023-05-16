import axios from 'axios';
import { expect } from 'chai';
import { describe } from 'mocha';
import chaiExclude from 'chai-exclude';
import { User } from 'src/entity/user';
import { hashString } from 'src/hash-string';
import { generateToken } from 'src/token';
import { userRepository, testerUserInput, defaultUserInput } from 'test/helpers';

describe('user', () => {
  let serverUrl: string;
  let token: string;
  let testerUserId: number;
  let mockUserId: number;

  const query = `#graphql
    query Query($userId: ID) {
      user(id: $userId) {
        birthDate
        email
        id
        name
      }
    }
  `;

  before(async () => {
    serverUrl = `http://localhost:${process.env.PORT}/`;

    await userRepository.delete({});

    const tester = new User();
    Object.assign(tester, testerUserInput);
    tester.password = await hashString(tester.password);
    await userRepository.save(tester);
    testerUserId = tester.id;
    token = generateToken(tester.id, true);

    const mock = new User();
    Object.assign(mock, defaultUserInput);
    mock.password = await hashString(mock.password);
    await userRepository.save(mock);
    mockUserId = mock.id;
  });

  it('should succeed if client is authenticated and query\'s id is valid', async () => {
    const res = (await axios.post(
      serverUrl,
      {
        query,
        variables: {
          userId: mockUserId,
        },
        operationName: 'Query',
      },
      {
        headers: {
          Authorization: token,
        },
      },
    )).data;
    
    expect(res.data.user).to.be.deep.equal({
      id: mockUserId.toString(),
      name: defaultUserInput.name,
      email: defaultUserInput.email,
      birthDate: defaultUserInput.birthDate,
    });
  });

  it('should fail if client queries an invalid id', async () => {
    const res = (await axios.post(
      serverUrl,
      {
        query,
        variables: {
          userId: mockUserId + 99,
        },
        operationName: 'Query',
      },
      {
        headers: {
          Authorization: token,
        },
      },
    )).data;

    expect(res.errors[0]).excluding('stacktrace').to.be.deep.equal({
      message: 'Not found',
      code: 404,
      details: 'user does not exist',
    });
  });
});
