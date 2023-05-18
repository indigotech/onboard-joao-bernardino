import axios from 'axios';
import { expect } from 'chai';
import { describe } from 'mocha';
import chaiExclude from 'chai-exclude';
import { getValidToken, insertAddressInDB, insertUserInDB, makeRequest, userRepository } from 'test/helpers';
import { validUserInput } from 'test/inputs';
import { userQuery } from 'test/graphql-snippets';

describe('user query', () => {
  afterEach(async () => {
    await userRepository.delete({});
  });

  it("should succeed if client is authenticated and query's id is valid", async () => {
    const token = getValidToken();
    const storedUser = await insertUserInDB(validUserInput);

    const address1 = await insertAddressInDB({
      cep: '12345678',
      street: 'Alameda ABC',
      streetNumber: 99,
      complement: 'apto. 99',
      neighborhood: 'Sumare',
      city: 'Sao Paulo',
      state: 'SP',
      user: storedUser,
    });

    const address2 = await insertAddressInDB({
      cep: '98754321',
      street: 'Alameda XYZ',
      streetNumber: 11,
      neighborhood: 'Moema',
      city: 'Sao Paulo',
      state: 'SP',
      user: storedUser,
    });

    const res = (await makeRequest({ query: userQuery, variables: { userId: storedUser.id }, token })).data;

    expect(res.data.user).to.be.deep.equal({
      id: storedUser.id.toString(),
      name: storedUser.name,
      email: storedUser.email,
      birthDate: storedUser.birthDate,
      addresses: [
        {
          id: address1.id.toString(),
          cep: address1.cep,
          street: address1.street,
          streetNumber: address1.streetNumber,
          complement: address1.complement,
          neighborhood: address1.neighborhood,
          city: address1.city,
          state: address1.state,
        },
        {
          id: address2.id.toString(),
          cep: address2.cep,
          street: address2.street,
          streetNumber: address2.streetNumber,
          complement: address2.complement,
          neighborhood: address2.neighborhood,
          city: address2.city,
          state: address2.state,
        },
      ],
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
