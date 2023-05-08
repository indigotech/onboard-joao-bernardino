import { UserInput } from './schema';
import { User } from './entity/user';

export const resolvers = {
  Query: {
    hello: () => 'wassup?',
  },
  Mutation: {
    createUser: async (_: unknown, { data }: { data: UserInput }) => {
      const newUser = new User();
      newUser.name = data.name;
      newUser.email = data.email;
      newUser.password = data.password;
      newUser.birthDate = data.birthDate;
      await newUser.save();
      return newUser;
    },
  },
};
