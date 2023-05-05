import { UserInput } from './schema';
import { User } from './entity/user';

export const resolvers = {
  Query: {
    hello: () => 'wassup?',
  },
  Mutation: {
    createUser: async (_: unknown, { data }: { data: UserInput }) => {
      const newUser = new User(data.name, data.email, data.password, data.birthDate);
      await newUser.save();
      return newUser;
    },
  },
};
