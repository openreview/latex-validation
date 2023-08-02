import _ from 'lodash';
import { respondWith, isGETEqual, withServerGen } from './http-server';


describe('REST Worker Endpoints', () => {

  it('should use withServer() and properly shutdown', async () => {
    for await (const __ of withServerGen((r) => {
      r.get('/bar', respondWith({ bar: 'foo' }))
      r.get('/foo', respondWith({ foo: 'bar' }))
    })) {
      await isGETEqual('http://localhost:9100/foo', { foo: 'bar' })
      await isGETEqual('http://localhost:9100/bar', { bar: 'foo' })
    }

  });

});
