import * as jwt from 'jsonwebtoken';

export function generateToken(userId: number) {
  return jwt.sign({ id: userId }, process.env.JWT_PRIVATE_KEY!, { expiresIn: `${process.env.JWT_EXPIRATION_HOURS}h` });
}
