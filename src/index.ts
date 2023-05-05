import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { AppDataSource } from './data-source';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

AppDataSource.initialize()
  .then(() => {
    console.log('db connected');
    const options = { listen: { port: 400 } };
    return startStandaloneServer(server, options);
  })
  .then(({ url }) => console.log(`🚀  Server ready at: ${url}`));
