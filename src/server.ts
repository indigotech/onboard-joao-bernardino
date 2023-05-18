import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { appDataSource } from './data-source';
import { formatError } from './format-error';
import { AppContext, context } from './context';

export async function initDatabase() {
  await appDataSource.setOptions({ url: process.env.DB_URL }).initialize();
}

export async function initServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
  });

  const { url } = await startStandaloneServer<AppContext>(server, { listen: { port: +process.env.PORT! }, context });
  console.log(`🚀  Server ready at: ${url}`);
  return server;
}

export async function run() {
  await initDatabase();
  return initServer();
}
