import { describe, it } from 'mocha';
import { run } from '../src/server';
import axios from 'axios';

before(() => run());

describe('Queries', () => {
  it('should respond to a hello query', async () => {
    const res = await axios.post('http://localhost:400/', {
      query: 'query Query {\n  hello\n}',
      variables: {},
      operationName: 'Query',
    });

    console.log(res.data);
  });
});
