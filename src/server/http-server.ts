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
