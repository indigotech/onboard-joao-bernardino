import * as jwt from 'jsonwebtoken';
import { BaseError } from './base-error';
import { appDataSource } from './data-source';
import { User } from './entity/user';

export async function authenticate(token: string) {
  let id: number;
  let payload: jwt.JwtPayload | string;
  const userRepository = appDataSource.getRepository(User);

  try {
    payload = jwt.verify(token, process.env.JWT_PRIVATE_KEY!);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError || e instanceof jwt.JsonWebTokenError || e instanceof jwt.NotBeforeError) {
      throw new BaseError('Authentication failed', 401, e.message);
    } else {
      throw e;
    }
  }

  if (!(payload instanceof String)) {
    id = (payload as jwt.JwtPayload).id;
    if (!(await userRepository.exist({ where: { id } }))) {
      throw new BaseError('Authentication failed', 401, 'invalid user');
    }
    return id;
  } else {
    throw new BaseError('Authentication failed', 401, 'invalid JWT payload');
  }
}
