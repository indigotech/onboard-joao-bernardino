import { LoginInput, UserInput } from './schema';
import { User } from './entity/user';
import { appDataSource } from './data-source';
import { validateUser } from './user-validation';
import { hashString } from './hash-string';
import { BaseError } from './base-error';
import { generateToken, getUserFromLoginInput } from './login';

const userRepository = appDataSource.getRepository(User);

export const resolvers = {
  Query: {
    hello: () => 'wassup?',
  },
  Mutation: {
    createUser: async (_: unknown, { data }: { data: UserInput }) => {
      const validationResult = await validateUser(data);
      if (!validationResult.validated) {
        throw validationResult.error;
      }

      const newUser = Object.assign(new User(), data);
      newUser.password = await hashString(data.password);

      await userRepository.save(newUser);
      return newUser;
    },

    login: async (_: unknown, { credentials }: { credentials: LoginInput }) => {
      const user = await getUserFromLoginInput(credentials);
      const token = generateToken();
      return { user, token };
    },
  },
};
