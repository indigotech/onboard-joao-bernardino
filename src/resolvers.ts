import { UserInput } from './schema';
import { User } from './entity/user';
import { validateUser } from './user-validation';
import { hashPassword } from './hash-password';

export const resolvers = {
  Query: {
    hello: () => 'wassup?',
  },
  Mutation: {
    createUser: async (_: unknown, { data }: { data: UserInput }) => {
      const newUser = Object.assign(new User(), data);

      const validationResult = await validateUser(newUser);
      if (!validationResult.validated) {
        throw new Error(validationResult.failureReason);
      }
      newUser.password = await hashPassword(newUser.password);

      await newUser.save();
      return newUser;
    },
  },
};
