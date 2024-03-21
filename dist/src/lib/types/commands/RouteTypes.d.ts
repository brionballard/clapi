import { type Router, type Request, type Response, type NextFunction } from "express";
interface RouteFunction {
    (router: Router): Router;
}
interface RouteObject {
    endpoint: string;
    router: Router;
    routes: RouteFunction;
}
interface RouteOptions {
    req: Request;
    res: Response;
    next: NextFunction;
}
export { type RouteFunction, type RouteObject, type RouteOptions };
