import { UserInput } from './schema';
import { User } from './entity/user';

export const resolvers = {
  Query: {
    hello: () => 'wassup?',
  },
  Mutation: {
    createUser: async (_: unknown, { data }: { data: UserInput }) => {
      if (!User.isValidPassword(data.password)) {
        throw new Error('Invalid password');
      } else if (!(await User.isValidEmail(data.email))) {
        throw new Error('Invalid email');
      }

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
