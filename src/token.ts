import * as jwt from 'jsonwebtoken';

export function generateToken(userId: number, extendExpirationTime?: boolean) {
  let expiresIn: string;

  if (extendExpirationTime) {
    expiresIn = `${process.env.JWT_EXTENDED_EXPIRATION_HOURS}h`;
  } else {
    expiresIn = `${process.env.JWT_EXPIRATION_HOURS}h`;
  }

  return jwt.sign({ id: userId }, process.env.JWT_PRIVATE_KEY!, { expiresIn });
}
