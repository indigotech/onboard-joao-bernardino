import { UserInput } from './schema';

export const resolvers = {
  Query: {
    hello: () => 'wassup?',
  },
  Mutation: {
    createUser: (_: unknown, { data }: { data: UserInput }) => {
      return {
        id: 1,
        name: data.name,
        email: data.email,
        birthDate: data.birthDate,
      };
    },
  },
};
