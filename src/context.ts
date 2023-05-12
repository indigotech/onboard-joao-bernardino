import { IncomingMessage } from 'http';

export interface AppContext {
  token?: string;
}

export async function context({ req }: { req: IncomingMessage }) {
  const token = req.headers.authorization;
  return { token };
}
