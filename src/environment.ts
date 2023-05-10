import * as dotenv from 'dotenv';

export function setupEnv() {
  if (process.env.APP_ENV == 'test') {
    dotenv.config({ path: `test.env` });
  } else {
    dotenv.config();
  }
}
