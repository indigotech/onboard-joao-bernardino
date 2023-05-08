import { hash } from 'bcrypt';

export async function hashPassword(password: string) {
  const saltRounds = 10;
  const hashed = await hash(password, saltRounds);
  return hashed;
}
