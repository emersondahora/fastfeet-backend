import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

/** Public routes */
routes.get('/', (req, res) => res.json({ application: 'Fast Feet' }));

routes.use(authMiddleware);
/** Private routes */

export default routes;
