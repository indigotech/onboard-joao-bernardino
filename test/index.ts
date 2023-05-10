import { describe, it } from 'mocha';
import { run } from '../src/server';
import { expect } from 'chai';
import axios from 'axios';

before(() => run());

describe('Queries', () => {
  it('should respond to a hello query', async () => {
    const res = await axios.post('http://localhost:400/', {
      query: 'query Query { hello }',
      variables: {},
      operationName: 'Query',
    });

    expect(res.data).to.deep.equal({ data: { hello: 'wassup?' } });
  });
});
