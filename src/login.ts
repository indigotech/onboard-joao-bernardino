import { compare } from 'bcrypt';
import { appDataSource } from './data-source';
import { User } from './entity/user';
import { LoginInput } from './inputs';
import { BaseError } from './base-error';
import { generateToken } from './token';

async function getUserFromLoginInput(credentials: LoginInput) {
  const userRepository = appDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ email: credentials.email });

  if (user && (await compare(credentials.password, user.password))) {
    return user;
  } else {
    throw new BaseError('Invalid credentials', 401, 'Wrong email or password');
  }
}

export async function getUserAndToken(credentials: LoginInput) {
  const user = await getUserFromLoginInput(credentials);
  const token = await generateToken(user.id, credentials.rememberMe);
  return { user, token };
}
