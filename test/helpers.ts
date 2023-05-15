import { appDataSource } from '../src/data-source';
import { User } from '../src/entity/user';

export const userRepository = appDataSource.getRepository(User);

// mock user data
export const defaultUserInput = {
  birthDate: '2003-19-01',
  email: 'john.smith@email.com',
  name: 'John Smith',
  password: 'password123',
};

// tests that require authentication authenticate as the 'tester' user
export const testerUserInput = {
  birthDate: '2003-19-01',
  email: 'tester@email.com',
  name: 'tester',
  password: 'password123',
};
