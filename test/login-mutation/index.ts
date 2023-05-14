import { describe, it, beforeEach } from 'mocha';
import { expect, use as chaiUse } from 'chai';
import * as jwt from 'jsonwebtoken';
import chaiExclude from 'chai-exclude';
import { requestLogin, defaultLoginInput, insertUserInDB } from './helpers';
import { userRepository } from '../helpers';

chaiUse(chaiExclude);

export function testLoginMutation(getServerUrl: () => string) {
  describe('login', () => {
    beforeEach(async () => {
      await userRepository.delete({});
    });

    it('should succeed if credentials are correct', async () => {
      const newUser = await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin(defaultLoginInput, getServerUrl())).data;
      const loginInfo = response.data.login;

      expect(loginInfo.user).to.deep.equal({
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      });

      const jwtPayload = jwt.verify(loginInfo.token, process.env.JWT_PRIVATE_KEY!) as jwt.JwtPayload;
      expect(jwtPayload).keys(['id', 'exp', 'iat']);
      expect(jwtPayload.id).to.equal(newUser.id);
      expect((jwtPayload.exp! - jwtPayload.iat!) / 3600).to.equal(+process.env.JWT_EXPIRATION_HOURS!);
    });

    it('should extend token lifetime if remeberMe is true', async () => {
      const newUser = await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin({ ...defaultLoginInput, rememberMe: true }, getServerUrl())).data;
      const loginInfo = response.data.login;

      expect(loginInfo.user).excluding(['password', 'id']).to.deep.equal(newUser);
      expect(+loginInfo.user.id).to.deep.equal(newUser.id);

      const jwtPayload = jwt.verify(loginInfo.token, process.env.JWT_PRIVATE_KEY!) as jwt.JwtPayload;
      expect(jwtPayload).keys(['id', 'exp', 'iat']);
      expect(jwtPayload.id).to.equal(newUser.id);
      expect((jwtPayload.exp! - jwtPayload.iat!) / 3600).to.equal(+process.env.JWT_EXTENDED_EXPIRATION_HOURS!);
    });

    it('should fail if no user has the given email', async () => {
      await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin({ ...defaultLoginInput, email: 'wrong@email.com' }, getServerUrl())).data;

      expect(response.errors[0]).excluding('stacktrace').to.deep.equal({
        message: 'Invalid credentials',
        code: 401,
        details: 'Wrong email or password',
      });
    });

    it('should fail if password is wrong', async () => {
      await insertUserInDB(defaultLoginInput);

      const response = (await requestLogin({ ...defaultLoginInput, password: 'wr0ngpassword' }, getServerUrl())).data;

      expect(response.errors[0]).excluding('stacktrace').to.deep.equal({
        message: 'Invalid credentials',
        code: 401,
        details: 'Wrong email or password',
      });
    });
  });
}
