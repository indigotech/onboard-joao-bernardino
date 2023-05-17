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
      await authenticate(contextValue.token);

      const queriedUser = await userRepository.findOne({ where: { id }, relations: { addresses: true } });
      if (!queriedUser) {
        throw new BaseError('Not found', 404, 'user does not exist');
      }
      return queriedUser;
    },
    users: async (
      _: unknown,
      { count = 10, offset = 0 }: { count: number; offset: number },
      contextValue: AppContext,
    ) => {
      await authenticate(contextValue.token);

      const [users, totalNumberOfUsers] = await userRepository.findAndCount({
        order: { name: 'ASC' },
        take: count,
        skip: offset,
      });

      return {
        users,
        totalNumberOfUsers,
        hasNextPage: offset + count < totalNumberOfUsers,
        hasPreviousPage: offset > 0,
      };
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
