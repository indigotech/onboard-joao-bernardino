import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import * as jwt from 'jsonwebtoken';
import chaiExclude from 'chai-exclude';
import { loginMutation } from './graphql-snippets';
import { makeRequest, insertUserInDB } from 'test/helpers';
import { validUserInput } from 'test/inputs';
import { userRepository } from 'test/helpers';

describe('login', () => {
  afterEach(async () => {
    await userRepository.delete({});
  });

  it('should succeed if credentials are correct', async () => {
    const newUser = await insertUserInDB(validUserInput);

    const res = (
      await makeRequest({
        query: loginMutation,
        variables: { credentials: { email: validUserInput.email, password: validUserInput.password } },
      })
    ).data;

    expect(res.data.login.user).to.deep.equal({
      id: newUser.id.toString(),
      name: newUser.name,
      email: newUser.email,
      birthDate: newUser.birthDate,
    });
    const jwtPayload = jwt.verify(res.data.login.token, process.env.JWT_PRIVATE_KEY!) as jwt.JwtPayload;
    expect(jwtPayload).keys(['id', 'exp', 'iat']);
    expect(jwtPayload.id).to.equal(newUser.id);
    expect((jwtPayload.exp! - jwtPayload.iat!) / 3600).to.equal(+process.env.JWT_EXPIRATION_HOURS!);
  });

  it('should extend token lifetime if remeberMe is true', async () => {
    const newUser = await insertUserInDB(validUserInput);

    const res = (
      await makeRequest({
        query: loginMutation,
        variables: {
          credentials: { email: validUserInput.email, password: validUserInput.password, rememberMe: true },
        },
      })
    ).data;

    expect(res.data.login.user).to.deep.equal({
      id: newUser.id.toString(),
      name: newUser.name,
      email: newUser.email,
      birthDate: newUser.birthDate,
    });
    const jwtPayload = jwt.verify(res.data.login.token, process.env.JWT_PRIVATE_KEY!) as jwt.JwtPayload;
    expect(jwtPayload).keys(['id', 'exp', 'iat']);
    expect(jwtPayload.id).to.equal(newUser.id);
    expect((jwtPayload.exp! - jwtPayload.iat!) / 3600).to.equal(+process.env.JWT_EXTENDED_EXPIRATION_HOURS!);
  });

  it('should fail if no user has the given email', async () => {
    const newUser = await insertUserInDB(validUserInput);

    const res = (
      await makeRequest({
        query: loginMutation,
        variables: {
          credentials: { email: 'wrong@email.com', password: validUserInput.password, rememberMe: true },
        },
      })
    ).data;

    expect(res.errors[0]).excluding('stacktrace').to.deep.equal({
      message: 'Invalid credentials',
      code: 401,
      details: 'Wrong email or password',
    });
  });

  it('should fail if password is wrong', async () => {
    const newUser = await insertUserInDB(validUserInput);

    const res = (
      await makeRequest({
        query: loginMutation,
        variables: {
          credentials: { email: validUserInput.email, password: 'wrongpassword123', rememberMe: true },
        },
      })
    ).data;

    expect(res.errors[0]).excluding('stacktrace').to.deep.equal({
      message: 'Invalid credentials',
      code: 401,
      details: 'Wrong email or password',
    });
  });
});
