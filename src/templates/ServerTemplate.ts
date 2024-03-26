export const ServerTemplate = `
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app: Express = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const PORT = process.env.APP_PORT ?? 4001;

if (PORT === undefined) {
  throw new Error('APP_PORT cannot be undefined!');
}

<!--apiRoutes.map((apiRoute: RouteObject) => {-->
<!--  return app.use(apiRoute.endpoint, apiRoute.routes(apiRoute.router));-->
<!--});-->

const server = app.listen(PORT, () => {
  console.log(\`⚡Server is running here 👉 http://localhost:\${PORT}\`);
});

server.timeout = 240000;

export {
  server,
  app
};
`
