import { describe, it } from 'mocha';
import { expect } from 'chai';
import { makeUserInput, requestUserCreation } from '../helpers';
import { User } from '../../../src/entity/user';
import { testerUserInput, userRepository } from '../../helpers';
import { generateToken } from '../../../src/token';
import { hashString } from '../../../src/hash-string';
import { compare } from 'bcrypt';
import chaiExclude from 'chai-exclude';
import { Not } from 'typeorm';

describe('user creation', () => {
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

  it('should create user in db and return it in response', async () => {
    const userInput = makeUserInput();
    const responseData = (await requestUserCreation(userInput, serverUrl, token)).data.data.createUser;
    const storedUserData = await userRepository.findOneBy({ id: responseData.id });

    expect(responseData).excluding(['id', 'password']).to.deep.equal(userInput);
    expect(storedUserData).excluding(['id', 'password']).to.deep.equal(userInput);

    expect(+responseData.id).to.equal(storedUserData!.id);
    expect(await compare(userInput.password, storedUserData!.password)).to.be.true;
  });
});
