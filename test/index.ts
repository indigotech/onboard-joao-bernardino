import { describe, before } from 'mocha';
import { use as chaiUse } from 'chai';
import chaiExclude from 'chai-exclude';
import { setupEnv } from '../src/environment';
import { run } from '../src/server';
import { testLoginMutation } from './login-mutation';
import { testCreateUserMutation } from './create-user-mutation';

chaiUse(chaiExclude);

let serverUrl: string;

before(async () => {
  setupEnv();
  serverUrl = `http://localhost:${process.env.PORT}/`;
  await run();
});

describe('Mutation', () => {
  testCreateUserMutation(() => serverUrl);
  testLoginMutation(() => serverUrl);
});
