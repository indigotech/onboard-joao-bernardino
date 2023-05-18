import { describe, it } from 'mocha';
import { expect } from 'chai';
import { compare } from 'bcrypt';
import exclude from 'chai-exclude';
import { User } from 'src/entity/user';
import { getValidToken, makeRequest, userRepository } from 'test/helpers';
import { createUserMutation } from 'test/graphql-snippets';
import { validUserInput } from 'test/inputs';

describe('createUser', () => {
  afterEach(async () => {
    await userRepository.delete({});
  });

  it('should create user in db and return it in response', async () => {
    const token = getValidToken();

    const res = (await makeRequest({ query: createUserMutation, variables: { data: validUserInput }, token })).data;

    const storedUserData = await userRepository.findOneBy({ id: res.data.createUser.id });
    expect(res.data.createUser).excluding(['id', 'password']).to.deep.equal(validUserInput);
    expect(res.data.createUser).excluding(['id', 'password']).to.deep.equal(validUserInput);
    expect(+res.data.createUser.id).to.equal(storedUserData!.id);
    expect(await compare(validUserInput.password, storedUserData!.password)).to.be.true;
  });

  it('should give an error in case of short passwords', async () => {
    const token = getValidToken();

    const res = (
      await makeRequest({
        query: createUserMutation,
        variables: { data: { ...validUserInput, password: 'sh0rt' } },
        token,
      })
    ).data;

    expect(res.errors[0]).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should have at least 6 characters',
    });
    expect(await userRepository.countBy({})).to.equal(0);
  });

  it('should give an error in case of passwords with no digits', async () => {
    const token = getValidToken();

    const res = (
      await makeRequest({
        query: createUserMutation,
        variables: { data: { ...validUserInput, password: 'nodigits' } },
        token,
      })
    ).data;

    expect(res.errors[0]).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should contain a digit',
    });
    expect(await userRepository.countBy({})).to.equal(0);
  });

  it('should give an error in case of passwords with no letters', async () => {
    const token = getValidToken();

    const res = (
      await makeRequest({
        query: createUserMutation,
        variables: { data: { ...validUserInput, password: '0123456789' } },
        token,
      })
    ).data;

    expect(res.errors[0]).excluding('stacktrace').to.deep.equal({
      message: 'invalid password',
      code: 400,
      details: 'password should contain a letter',
    });
    expect(await userRepository.countBy({})).to.equal(0);
  });

  it('should give an error in case of emails with incorrect formats', async () => {
    const token = getValidToken();

    const res = (
      await makeRequest({
        query: createUserMutation,
        variables: { data: { ...validUserInput, email: 'bademail.com' } },
        token,
      })
    ).data;

    expect(res.errors[0]).excluding('stacktrace').to.deep.equal({
      message: 'invalid email',
      code: 400,
      details: 'email has invalid format',
    });
    expect(await userRepository.countBy({})).to.equal(0);
  });

  it('should give an error in case of duplicated emails', async () => {
    const token = getValidToken();
    const existingUser = new User();
    Object.assign(existingUser, validUserInput);
    await userRepository.save(existingUser);

    const res = (await makeRequest({ query: createUserMutation, variables: { data: validUserInput }, token })).data;

    expect(res.errors[0]).excluding('stacktrace').to.deep.equal({
      message: 'invalid email',
      code: 400,
      details: 'an user with that email already exists',
    });
    expect(await userRepository.countBy({})).to.equal(1);
  });
});
