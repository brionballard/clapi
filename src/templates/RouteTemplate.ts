export const RouteTemplate = `
/**
 * Defines {name} based API routes.
 */
export const {name} = (router) => {
    router.get('/', async (req, res, next) => {
        try {
            // Get Many {name}
        } catch (error) {
            next(error)
        }
    });
    
    router.get('/:id', async (req, res, next) => {
        try {
         // Get One {name}
        } catch (error) {
            next(error)
        }
    });
    
    router.post('/', async (req, res, next) => {
        try {
         // Create One {name}
        } catch (error) {
            next(error)
        }
    });
    
    router.put('/:id', async (req, res, next) => {
        try {
         // Update One {name}
        } catch (error) {
            next(error)
        }
    });
    
    router.patch('/:id', async (req, res, next) => {
        try {
         // Update partial {name}
        } catch (error) {
            next(error)
        }
    });
    
    router.delete('/:id', async (req, res, next) => {
        try {
         // Destroy One {name}
        } catch (error) {
            next(error)
        }
    });
        
    return router;
};`


export const TSRouteTemplate = `import { type Router, type Request, type Response, type NextFunction } from "express";
import { type RouteFunction, type RouteOptions } from "clapi-bb/dist/types";


/**
 * Defines {name} based API routes.
 */
export const {name}: RouteFunction = (router: Router): Router => {
    router.get('/', async (options: RouteOptions) => {
        try {
            // Get Many {name}
        } catch (error) {
            options.next(error)
        }
    });
    
    router.get('/:id', async (options: RouteOptions) => {
        try {
         // Get One {name}
        } catch (error) {
            options.next(error)
        }
    });
    
    router.post('/', async (options: RouteOptions) => {
        try {
         // Create One {name}
        } catch (error) {
            options.next(error)
        }
    });
    
    router.put('/:id', async (options: RouteOptions) => {
        try {
         // Update One {name}
        } catch (error) {
            options.next(error)
        }
    });
    
    router.patch('/:id', async (options: RouteOptions) => {
        try {
         // Update partial {name}
        } catch (error) {
            options.next(error)
        }
    });
    
    router.delete('/:id', async (options: RouteOptions) => {
        try {
         // Destroy One {name}
        } catch (error) {
            options.next(error)
        }
    });
        
    return router;
};`
