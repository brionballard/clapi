"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.server = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import { type RouteFunction, type RouteOptions } from "clapi-bb/dist/types";
// import { httpErrorHandler } from './httpErrorHandling';
// import { apiRoutes } from '../../transport/http/routes';
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '2gb' }));
const PORT = process.env.APP_PORT ?? 4000;
if (PORT === undefined) {
    throw new Error('APP_PORT must be set');
}
// loop through your routes or use app.use()
// apiRoutes.map((apiRoute: RouteObject) => {
//   return app.use(apiRoute.endpoint, apiRoute.routes(apiRoute.router));
// });
const server = app.listen(PORT, () => {
    console.log(`⚡Server is running here 👉 http://localhost:${PORT}`);
});
exports.server = server;
// Handle HTTP errors
// app.use(httpErrorHandler);
server.timeout = 30000;
