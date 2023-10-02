import _ from 'lodash';
import Koa from 'koa';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import json from 'koa-json';
import { Server } from 'http';
import axios from 'axios';
import Application from 'koa';
import { prettyPrint, putStrLn } from '~/util/pretty-print';


export type WithServerCallbackArgs = {
  server: Server;
};

export async function* withServerGen(
  setup: (router: Router) => void,
): AsyncGenerator<Server, void, any> {
  const routes = new Router();
  const app = new Koa();
  app.use(koaBody());
  app.use(json({ pretty: false }));

  setup(routes);

  // TODO config port
  const port = process.env.PORT || 8080;

  app.use(routes.routes());
  app.use(routes.allowedMethods());

  const server = await new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      putStrLn(`Koa is listening to http://localhost:${port}`);
      resolve(server);
    });
  });
  try {
    yield server;
  } finally {
    await closeServer(server);
  }
}

export async function isGETEqual(
  url: string,
  data: any
) {
  const resp = await axios.get(url);
  expect(resp.data).toEqual(data);
}

export async function isPOSTEqual(
  url: string,
  data: any
) {
  const resp = await axios.post(url);
  expect(resp.data).toEqual(data);
}

export function respondWith(
  body: Record<string, any>
): (ctx: Application.ParameterizedContext) => void {
  return (ctx) => {
    const { response } = ctx;
    response.type = 'application/json';
    response.status = 200;
    response.body = body;
  };
}

export function responseHandler(
  body: Record<string, any>
): (ctx: Application.ParameterizedContext) => void {
  return (ctx) => {
    const { response } = ctx;
    response.type = 'application/json';
    response.status = 200;
    response.body = body;
  };
}


export function respondWithHtml(
  body: string
): (ctx: Application.ParameterizedContext) => void {
  return (ctx) => {
    const { response } = ctx;
    response.type = 'text/html';
    response.status = 200;
    response.body = body;
  };
}

// export async function startTestServer(): Promise<Server> {
//   const app = new Koa();

//   const port = process.env.PORT || 8080;

//   const htmlRoutes = htmlRouter();

//   app.use(htmlRoutes.routes());
//   app.use(htmlRoutes.allowedMethods());

//   return new Promise((resolve) => {
//     const server = app.listen(port, () => {
//       putStrLn(`Koa is listening to http://localhost:${port}`);
//       resolve(server);
//     });
//   });
// }

// export async function resetTestServer(workingDir: string): Promise<Server> {
//   fs.emptyDirSync(workingDir);
//   fs.removeSync(workingDir);
//   fs.mkdirSync(workingDir);
//   return startTestServer();
// }

export async function closeServer(server: Server | undefined): Promise<void> {
  if (server === undefined) return;
  return new Promise((resolve) => {
    server.on('close', () => {
      putStrLn('test server closed.');
    });
    server.close((error?: Error) => {
      putStrLn('test server close Callback.');
      if (error) {
        prettyPrint({ error })
      }
      resolve(undefined);
    });
  });
}

// function htmlRouter(): Router<Koa.DefaultState, Koa.DefaultContext> {
//   const router = new Router({ routerPath: '/echo' });

//   router.get('/echo', async (ctx: Context) => {
//     // putStrLn(`${ctx.method} ${ctx.path}`);
//     const { response } = ctx;
//     const query = ctx.query;
//     response.type = 'application/json';
//     response.status = 200;
//     response.body = query || {};
//   })

//   router.get(/[/]htmls[/].*/, async (ctx: Context, next: () => Promise<any>) => {
//     const { response, path } = ctx;
//     // putStrLn(`html router; ${path}`);
//     prettyPrint({ testServer: path });
//     const pathTail = path.slice('/htmls/'.length);
//     // const pathTail = path.slice(1);
//     const [status, respKey, maybeTimeout] = pathTail.split(/~/);
//     const timeout = maybeTimeout ? Number.parseInt(maybeTimeout) : 0;
//     prettyPrint({ status, respKey, timeout });

//     response.type = 'html';
//     response.status = Number.parseInt(status, 10);
//     // response.body = htmlSamples[respKey] || 'Unknown';
//     await next();
//   });


//   return router;
// }
