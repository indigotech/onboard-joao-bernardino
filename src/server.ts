import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { appDataSource } from './data-source';

export async function run() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  const options = { listen: { port: 400 } };

  await appDataSource.initialize();
  const { url } = await startStandaloneServer(server, options);
  console.log(`🚀  Server ready at: ${url}`);
}
