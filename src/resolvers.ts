import { LoginInput, UserInput } from './inputs';
import { User } from './entity/user';
import { appDataSource } from './data-source';
import { validateUser } from './user-validation';
import { hashString } from './hash-string';
import { getUserAndToken } from './login';
import { AppContext } from './context';
import { authenticate } from './authenticate';
import { BaseError } from './base-error';

const userRepository = appDataSource.getRepository(User);

export const resolvers = {
  Query: {
    hello: () => 'wassup?',
  },
  Mutation: {
    createUser: async (_: unknown, { data }: { data: UserInput }, contextValue: AppContext) => {
      await authenticate(contextValue.token);

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
      return getUserAndToken(credentials);
    },
  },
};
