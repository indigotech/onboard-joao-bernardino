import { appDataSource } from '../src/data-source';
import { User } from '../src/entity/user';

export const userRepository = appDataSource.getRepository(User);

export const defaultUserInput = {
  birthDate: '2003-19-01',
  email: 'john.smith@email.com',
  name: 'John Smith',
  password: 'password123',
};
