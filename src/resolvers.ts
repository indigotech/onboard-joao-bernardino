import { LoginInput, UserInput } from 'src/inputs';
import { User } from 'src/entity/user';
import { appDataSource } from 'src/data-source';
import { validateUser } from 'src/user-validation';
import { hashString } from 'src/hash-string';
import { getUserAndToken } from 'src/login';
import { AppContext } from 'src/context';
import { authenticate } from 'src/authenticate';
import { BaseError } from 'src/base-error';

const userRepository = appDataSource.getRepository(User);

export const resolvers = {
  Query: {
    user: async (_: unknown, { id }: { id: number }, contextValue: AppContext) => {
      if (contextValue.token) {
        const id = authenticate(contextValue.token);
        if (!(await userRepository.exist({ where: { id } }))) {
          throw new BaseError('Authentication failed', 401, 'invalid user');
        }
      } else {
        throw new BaseError('Authentication failed', 401, 'no token provided');
      }

      const queriedUser = await userRepository.findOneBy({ id });
      if (queriedUser) {
        return queriedUser;
      } else {
        throw new BaseError('Not found', 404, 'user does not exist');
      }
    },
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
