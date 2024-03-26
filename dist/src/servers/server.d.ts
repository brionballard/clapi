/// <reference types="node" />
import { type Express } from 'express';
import { type IncomingMessage, type Server, type ServerResponse } from 'http';
declare const app: Express;
declare const server: Server<typeof IncomingMessage, typeof ServerResponse>;
export { server, app };
