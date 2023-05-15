import { before } from 'mocha';
import { use as chaiUse } from 'chai';
import chaiExclude from 'chai-exclude';
import { setupEnv } from 'src/environment';
import { run } from 'src/server';

before(async () => {
  chaiUse(chaiExclude);
  setupEnv();
  await run();
});

require('./mutation');
require('./query');
