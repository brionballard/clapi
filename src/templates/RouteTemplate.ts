export const RouteTemplate = `
/**
 * Defines {name} based API routes.
 */
export const {name} = (router) => {
    router.get('/', async (req, res, next) => {
        try {
            // Get Many
        } catch (error) {
            next(error)
        }
    });
    
    router.get('/:id', async (req, res, next) => {
        try {
         // Get One
        } catch (error) {
            next(error)
        }
    });
    
    router.post('/', async (req, res, next) => {
        try {
         // Create One
        } catch (error) {
            next(error)
        }
    });
    
    router.put('/:id', async (req, res, next) => {
        try {
         // Update One
        } catch (error) {
            next(error)
        }
    });
    
    router.patch('/:id', async (req, res, next) => {
        try {
         // Update partial
        } catch (error) {
            next(error)
        }
    });
    
    router.delete('/:id', async (req, res, next) => {
        try {
         // Destroy One
        } catch (error) {
            next(error)
        }
    });
        
    return router;
};`


