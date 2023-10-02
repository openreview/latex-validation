import Router from '@koa/router';
import { respondWith, withServerGen } from './http-server';
import { Context } from 'koa';
import { prettyPrint } from '~/util/pretty-print';
import { isSuccess, validateLatexFragment } from '~/latex/validate';

import _ from 'lodash';
import { Server } from 'http';


export async function* withRestServer(packageList: string[]): AsyncGenerator<Server, void, void> {
  for await (const server of withServerGen(setupRestRoutes(packageList))) {
    yield server;
  }
}

function setupRestRoutes(packageList: string[]): (r: Router) => void {
  function doSetup(router: Router): void {
    router.post('/latex/fragment', async (ctx: Context) => {
      const body = ctx.request.body;
      prettyPrint({ body });

      const latex: string | undefined = body['latex'];

      if (!_.isString(latex)) {
        respondWith({ status: 'invalid-input', message: 'must include data field latex=Some Latex Fragment' })(ctx)
        return;
      }

      const packages = packageList;
      const result = await validateLatexFragment(latex, packages);
      if (!isSuccess(result)) {
        const message = result.errors.map(e => e.message).join('\n');
        respondWith({ status: 'error', message })(ctx)
        return;
      }

      respondWith({ status: 'ok' })(ctx)
    });
  }
  return doSetup;
}
