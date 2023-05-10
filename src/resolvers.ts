import { LoginInput, UserInput } from './schema';
import { User } from './entity/user';
import { appDataSource } from './data-source';
import { validateUser } from './user-validation';
import { hashString } from './hash-string';
import { BaseError } from './base-error';

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

    login: (_: unknown, { credentials }: { credentials: LoginInput }) => {
      return {
        user: {
          id: 12,
          name: 'User Name',
          email: 'User e-mail',
          birthDate: '04-25-1990',
        },
        token: 'the_token',
      };
    },
  },
};
