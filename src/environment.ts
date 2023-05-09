import * as dotenv from 'dotenv';

export function setupEnv() {
  dotenv.config({ path: `${process.env.NODE_ENV || ''}.env` });
}
