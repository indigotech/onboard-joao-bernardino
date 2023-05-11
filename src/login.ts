import { compare } from 'bcrypt';
import { appDataSource } from './data-source';
import { User } from './entity/user';
import { LoginInput } from './schema';
import { BaseError } from './base-error';

export async function getUserFromLoginInput(credentials: LoginInput) {
  const userRepository = appDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email: credentials.email } });

  if (user) {
    if (await compare(credentials.password, user.password)) {
      return user;
    } else {
      throw new BaseError('Invalid credentials', 400, 'Wrong password');
    }
  } else {
    throw new BaseError('Invalid credentials', 400, 'No user with this email');
  }
}

export async function generateToken() {
  return '';
}
