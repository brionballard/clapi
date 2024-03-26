"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSServerTemplate = exports.ServerTemplate = void 0;
exports.ServerTemplate = `import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
// import { httpErrorHandler } from './httpErrorHandling';
// import { apiRoutes } from '../../transport/http/routes';

const app: Express = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const PORT = process.env.APP_PORT ?? {defaultPort};

if (PORT === undefined) {
  throw new Error('APP_PORT cannot be undefined!');
}

// apiRoutes.map((apiRoute) => {
//   return app.use(apiRoute.endpoint, apiRoute.routes(apiRoute.router));
// });

const {name} = app.listen(PORT, () => {
  console.log(\`⚡Server is running here 👉 http://localhost:\${PORT}\`);
});

// app.use(httpErrorHandler);

{name}.timeout = 30000;

export {
  {name},
  app
};
`;
exports.TSServerTemplate = `import dotenv from 'dotenv';
dotenv.config();

import express, { type Express } from 'express';
import cors from 'cors';
import { type IncomingMessage, type Server, type ServerResponse } from 'http';

// import { type RouteFunction, type RouteOptions } from "clapi-bb/dist/types";
// import { httpErrorHandler } from './httpErrorHandling';
// import { apiRoutes } from '../../transport/http/routes';

const app: Express = express();
app.use(cors());
app.use(express.json({ limit: '2gb' }));

const PORT = process.env.APP_PORT ?? {defaultPort};

if (PORT === undefined) {
  throw new Error('APP_PORT must be set');
}

// loop through your routes or use app.use()
// apiRoutes.map((apiRoute: RouteObject) => {
//   return app.use(apiRoute.endpoint, apiRoute.routes(apiRoute.router));
// });

const server: Server<typeof IncomingMessage, typeof ServerResponse> = app.listen(PORT, () => {
  console.log(\`⚡Server is running here 👉 http://localhost:$\{PORT}\`);
});

// Handle HTTP errors
// app.use(httpErrorHandler);

server.timeout = 30000;

export {
  server,
  app
};
`;
