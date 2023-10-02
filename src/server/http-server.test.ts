import _ from 'lodash';
import { respondWith, isGETEqual, withServerGen } from './http-server';


describe('HTTP Server', () => {

  it('should use withServer() and properly shutdown', async () => {
    for await (const __ of withServerGen((r) => {
      r.get('/bar', respondWith({ bar: 'foo' }))
      r.get('/foo', respondWith({ foo: 'bar' }))
    })) {
      await isGETEqual('http://localhost:8080/foo', { foo: 'bar' })
      await isGETEqual('http://localhost:8080/bar', { bar: 'foo' })
    }

  });

});
