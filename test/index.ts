import { describe, it } from 'mocha';
import { run } from '../src/server';
import { expect } from 'chai';
import { setupEnv } from '../src/environment';
import axios from 'axios';

before(async () => {
  setupEnv();
  await run();
});

describe('Queries', () => {
  it('should respond to a hello query', async () => {
    const res = await axios.post(`http://localhost:${process.env.PORT}/`, {
      query: 'query Query { hello }',
      variables: {},
      operationName: 'Query',
    });

    expect(res.data).to.deep.equal({ data: { hello: 'wassup?' } });
  });
});
