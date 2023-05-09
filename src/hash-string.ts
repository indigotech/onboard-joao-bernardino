import { hash } from 'bcrypt';

export async function hashString(str: string) {
  const saltRounds = 10;
  const hashed = await hash(str, saltRounds);
  return hashed;
}
