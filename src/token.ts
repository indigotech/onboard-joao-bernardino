import * as jwt from 'jsonwebtoken';
import { BaseError } from './base-error';

export function generateToken(userId: number, extendExpirationTime?: boolean) {
  let expiresIn: string;

  if (extendExpirationTime) {
    expiresIn = `${process.env.JWT_EXTENDED_EXPIRATION_HOURS}h`;
  } else {
    expiresIn = `${process.env.JWT_EXPIRATION_HOURS}h`;
  }

  return jwt.sign({ id: userId }, process.env.JWT_PRIVATE_KEY!, { expiresIn });
}

export function authenticate(token: string) {
  let id: number;
  let payload: jwt.JwtPayload | string;

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
    return id;
  } else {
    throw new BaseError('Authentication failed', 401, 'invalid JWT payload');
  }
}
