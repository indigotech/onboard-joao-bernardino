import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { appDataSource } from './data-source';
import { formatError } from './format-error';

export async function initDatabase() {
  await appDataSource.setOptions({ url: process.env.DB_URL }).initialize();
}

export async function initServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: formatError,
  });

  const { url } = await startStandaloneServer(server, { listen: { port: +process.env.PORT! } });
  console.log(`🚀  Server ready at: ${url}`);
}

export async function run() {
  await initDatabase();
  await initServer();
}
