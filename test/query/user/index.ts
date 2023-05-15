import { describe } from 'mocha';
import { User } from 'src/entity/user';
import { hashString } from 'src/hash-string';
import { generateToken } from 'src/token';
import { userRepository, testerUserInput } from 'test/helpers';

describe('user', () => {
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

  it('should return the data for an authenticated user', () => {

  });
});
